/**
 * Client-side validation for the sign-up form.
 * The rules mirror the backend (RegisterRequestDto / IutStudentEmailAttribute) so people get
 * instant feedback; the backend stays the source of truth.
 */

export const EDUCATION_LEVELS = [
  { value: 'Undergraduate', label: 'کارشناسی' },
  { value: 'Master', label: 'کارشناسی ارشد' },
  { value: 'Doctoral', label: 'دکتری' },
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number]['value'];

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  studentNumber: string;
  entryYear: string;
  educationLevel: EducationLevel | '';
  telegramId: string;
  password: string;
  confirmPassword: string;
}

export type RegisterFieldName = keyof RegisterFormValues;
export type RegisterErrors = Partial<Record<RegisterFieldName, string>>;

/** Body of POST /api/auth/register */
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  studentNumber: string;
  entryYear: number;
  educationLevel: EducationLevel;
  telegramId: string | null;
  password: string;
}

export const MIN_ENTRY_YEAR = 1380;

/** *@*.iut.ac.ir  – at least one sub-domain label is required ("@iut.ac.ir" alone is rejected). */
const IUT_EMAIL_REGEX = /^[a-z0-9._%+-]+@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+iut\.ac\.ir$/i;
const PHONE_REGEX = /^09\d{9}$/;
const STUDENT_NUMBER_REGEX = /^\d{6,12}$/;
const TELEGRAM_REGEX = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/;

export const isIutEmail = (value: string): boolean => {
  const email = value.trim();
  return email.length <= 254 && IUT_EMAIL_REGEX.test(email);
};

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits -> 0-9 */
export const toEnglishDigits = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

/** "+98 912 345 6789", "0098912..." and Persian digits all become 09123456789. */
export const normalizePhone = (value: string): string => {
  let v = toEnglishDigits(value).replace(/[\s\-()]/g, '');
  if (v.startsWith('+98')) v = '0' + v.slice(3);
  else if (v.startsWith('0098')) v = '0' + v.slice(4);
  return v;
};

/** Current solar-hijri (Persian) year. */
export const getCurrentPersianYear = (now: Date = new Date()): number => {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric' }).formatToParts(now);
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    if (Number.isFinite(year) && year > 1000) return year;
  } catch {
    /* fall through to the approximation */
  }
  return now.getFullYear() - 621;
};

export const PASSWORD_RULES_TEXT = 'حداقل ۸ کاراکتر، شامل حرف بزرگ و کوچک انگلیسی، عدد و یک نماد (مثل ! یا @)';

const passwordError = (password: string): string | undefined => {
  if (!password) return 'رمز عبور را وارد کنید.';
  if (password.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
  if (password.length > 128) return 'رمز عبور نباید بیشتر از ۱۲۸ کاراکتر باشد.';
  if (!/[a-z]/.test(password)) return 'رمز عبور باید شامل حداقل یک حرف کوچک انگلیسی باشد.';
  if (!/[A-Z]/.test(password)) return 'رمز عبور باید شامل حداقل یک حرف بزرگ انگلیسی باشد.';
  if (!/\d/.test(password)) return 'رمز عبور باید شامل حداقل یک عدد باشد.';
  if (!/[^\p{L}\p{N}]/u.test(password)) return 'رمز عبور باید شامل حداقل یک نماد (مثل ! یا @) باشد.';
  return undefined;
};

export const validateField = (
  name: RegisterFieldName,
  values: RegisterFormValues,
  now: Date = new Date(),
): string | undefined => {
  switch (name) {
    case 'firstName':
      if (!values.firstName.trim()) return 'نام را وارد کنید.';
      if (values.firstName.trim().length > 255) return 'نام نباید بیشتر از ۲۵۵ کاراکتر باشد.';
      return undefined;

    case 'lastName':
      if (!values.lastName.trim()) return 'نام خانوادگی را وارد کنید.';
      if (values.lastName.trim().length > 255) return 'نام خانوادگی نباید بیشتر از ۲۵۵ کاراکتر باشد.';
      return undefined;

    case 'email':
      if (!values.email.trim()) return 'ایمیل دانشجویی را وارد کنید.';
      if (!isIutEmail(values.email)) return 'ایمیل باید به شکل name@faculty.iut.ac.ir باشد.';
      return undefined;

    case 'contactNumber':
      if (!values.contactNumber.trim()) return 'شماره تماس را وارد کنید.';
      if (!PHONE_REGEX.test(normalizePhone(values.contactNumber))) return 'شماره تماس باید مانند 09123456789 باشد.';
      return undefined;

    case 'studentNumber':
      if (!values.studentNumber.trim()) return 'شماره دانشجویی را وارد کنید.';
      if (!STUDENT_NUMBER_REGEX.test(toEnglishDigits(values.studentNumber).trim()))
        return 'شماره دانشجویی باید بین ۶ تا ۱۲ رقم باشد.';
      return undefined;

    case 'entryYear': {
      const raw = toEnglishDigits(values.entryYear).trim();
      if (!raw) return 'سال ورود را وارد کنید.';
      const max = getCurrentPersianYear(now);
      const year = Number(raw);
      if (!/^\d{4}$/.test(raw) || year < MIN_ENTRY_YEAR || year > max)
        return `سال ورود را به تقویم شمسی و بین ${MIN_ENTRY_YEAR} تا ${max} وارد کنید.`;
      return undefined;
    }

    case 'educationLevel':
      return values.educationLevel ? undefined : 'مقطع تحصیلی را انتخاب کنید.';

    case 'telegramId':
      if (values.telegramId.trim() && !TELEGRAM_REGEX.test(values.telegramId.trim()))
        return 'آیدی تلگرام معتبر نیست (۵ تا ۳۲ کاراکتر انگلیسی، عدد یا _).';
      return undefined;

    case 'password':
      return passwordError(values.password);

    case 'confirmPassword':
      if (!values.confirmPassword) return 'رمز عبور را دوباره وارد کنید.';
      if (values.confirmPassword !== values.password) return 'تکرار رمز عبور با رمز عبور یکسان نیست.';
      return undefined;
  }
};

export const FIELD_ORDER: RegisterFieldName[] = [
  'firstName',
  'lastName',
  'email',
  'contactNumber',
  'studentNumber',
  'entryYear',
  'educationLevel',
  'telegramId',
  'password',
  'confirmPassword',
];

export const validateRegisterForm = (values: RegisterFormValues, now: Date = new Date()): RegisterErrors => {
  const errors: RegisterErrors = {};
  for (const name of FIELD_ORDER) {
    const message = validateField(name, values, now);
    if (message) errors[name] = message;
  }
  return errors;
};

/** Cleans the form values into the JSON the backend expects. Call only after validation passed. */
export const toRegisterPayload = (values: RegisterFormValues): RegisterPayload => {
  const telegram = values.telegramId.trim().replace(/^@/, '');
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    contactNumber: normalizePhone(values.contactNumber),
    studentNumber: toEnglishDigits(values.studentNumber).trim(),
    entryYear: Number(toEnglishDigits(values.entryYear).trim()),
    educationLevel: values.educationLevel as EducationLevel,
    telegramId: telegram || null,
    password: values.password,
  };
};
