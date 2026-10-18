import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LoaderCircle, UserRoundPlus } from 'lucide-react';
import FormField from '../components/FormField';
import { describedBy } from '../lib/aria';
import { registerUser } from '../lib/authApi';
import { ApiError } from '../lib/http';
import {
  EDUCATION_LEVELS,
  FIELD_ORDER,
  PASSWORD_RULES_TEXT,
  toEnglishDigits,
  toRegisterPayload,
  validateField,
  validateRegisterForm,
} from '../lib/validation';
import type { RegisterErrors, RegisterFieldName, RegisterFormValues } from '../lib/validation';

const INITIAL_VALUES: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  studentNumber: '',
  entryYear: '',
  educationLevel: '',
  telegramId: '',
  password: '',
  confirmPassword: '',
};

/** Fields whose characters are converted to English digits while typing. */
const DIGIT_FIELDS: RegisterFieldName[] = ['contactNumber', 'studentNumber', 'entryYear'];

const inputClass = (hasError: boolean) =>
  `lab-input ${hasError ? 'border-red-400/60 focus:border-red-400/70 focus:ring-red-400/10' : ''}`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState<Partial<Record<RegisterFieldName, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setFieldError = (name: RegisterFieldName, message: string | undefined) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as RegisterFieldName;
    let value = e.target.value;
    if (DIGIT_FIELDS.includes(name)) value = toEnglishDigits(value);

    const next = { ...values, [name]: value } as RegisterFormValues;
    setValues(next);

    // Re-validate as the person types, but only fields that were already visited / already show an error.
    if (touched[name] || errors[name]) setFieldError(name, validateField(name, next));
    // Keep "confirm password" in sync when the password changes.
    if (name === 'password' && touched.confirmPassword) setFieldError('confirmPassword', validateField('confirmPassword', next));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as RegisterFieldName;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldError(name, validateField(name, values));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const validation = validateRegisterForm(values);
    setTouched(Object.fromEntries(FIELD_ORDER.map((n) => [n, true])));
    setErrors(validation);

    const firstInvalid = FIELD_ORDER.find((n) => validation[n]);
    if (firstInvalid) {
      toast.error('لطفاً موارد مشخص‌شده را اصلاح کنید.');
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload = toRegisterPayload(values);
      const result = await registerUser(payload);
      navigate('/register/check-email', {
        state: { email: payload.email, resendAfterSeconds: result.resendAfterSeconds },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const serverErrors: RegisterErrors = {};
        for (const name of FIELD_ORDER) {
          if (err.fieldErrors[name]) serverErrors[name] = err.fieldErrors[name];
        }
        if (Object.keys(serverErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...serverErrors }));
          const first = FIELD_ORDER.find((n) => serverErrors[n]);
          if (first) document.getElementById(first)?.focus();
        }
        toast.error(err.message);
      } else {
        toast.error('خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: RegisterFieldName, hint?: string) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': describedBy(name, Boolean(errors[name]), Boolean(hint)),
    className: inputClass(Boolean(errors[name])),
  });

  return (
    <main className="lab-container pb-16 pt-28 lg:pt-36">
      <div className="mx-auto w-full max-w-2xl animate-[heroSlideUp_0.6s_ease-out_both]">
        <header className="mb-8 text-center">
          <span className="lab-kicker">
            <UserRoundPlus size={14} aria-hidden="true" />
            ثبت‌نام
          </span>
          <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">ساخت حساب کاربری</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            برای ثبت‌نام به ایمیل دانشجویی دانشگاه صنعتی اصفهان نیاز دارید. پس از ارسال فرم، یک ایمیل تأیید برای شما
            می‌فرستیم و حساب شما فقط پس از کلیک روی لینک داخل آن ساخته می‌شود.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="lab-card flex flex-col gap-5 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="firstName" label="نام" error={errors.firstName}>
              <input {...field('firstName')} type="text" autoComplete="given-name" maxLength={255} />
            </FormField>
            <FormField id="lastName" label="نام خانوادگی" error={errors.lastName}>
              <input {...field('lastName')} type="text" autoComplete="family-name" maxLength={255} />
            </FormField>
          </div>

          <FormField
            id="email"
            label="ایمیل دانشجویی"
            error={errors.email}
            hint="باید به شکل name@faculty.iut.ac.ir باشد؛ مثلاً ‎m.rezaei@ec.iut.ac.ir"
          >
            <input
              {...field('email', 'hint')}
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              placeholder="name@faculty.iut.ac.ir"
              maxLength={254}
              className={`${inputClass(Boolean(errors.email))} text-left`}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="contactNumber" label="شماره تماس" error={errors.contactNumber}>
              <input
                {...field('contactNumber')}
                type="tel"
                dir="ltr"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="09123456789"
                className={`${inputClass(Boolean(errors.contactNumber))} text-left`}
              />
            </FormField>
            <FormField id="studentNumber" label="شماره دانشجویی" error={errors.studentNumber}>
              <input
                {...field('studentNumber')}
                type="text"
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                maxLength={12}
                className={`${inputClass(Boolean(errors.studentNumber))} text-left`}
              />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="entryYear" label="سال ورود (شمسی)" error={errors.entryYear} hint="مثلاً ۱۴۰۳">
              <input
                {...field('entryYear', 'hint')}
                type="text"
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                className={`${inputClass(Boolean(errors.entryYear))} text-left`}
              />
            </FormField>
            <FormField id="educationLevel" label="مقطع تحصیلی" error={errors.educationLevel}>
              <select {...field('educationLevel')}>
                <option value="">انتخاب کنید</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level.value} value={level.value} className="bg-slate-900">
                    {level.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField id="telegramId" label="آیدی تلگرام" optional error={errors.telegramId}>
            <input
              {...field('telegramId')}
              type="text"
              dir="ltr"
              autoComplete="off"
              placeholder="@username"
              maxLength={33}
              className={`${inputClass(Boolean(errors.telegramId))} text-left`}
            />
          </FormField>

          <FormField id="password" label="رمز عبور" error={errors.password} hint={PASSWORD_RULES_TEXT}>
            <div className="relative">
              <input
                {...field('password', 'hint')}
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                maxLength={128}
                className={`${inputClass(Boolean(errors.password))} pr-12 text-left`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-white"
                aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </FormField>

          <FormField id="confirmPassword" label="تکرار رمز عبور" error={errors.confirmPassword}>
            <input
              {...field('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              autoComplete="new-password"
              maxLength={128}
              className={`${inputClass(Boolean(errors.confirmPassword))} text-left`}
            />
          </FormField>

          <button type="submit" className="lab-button-primary mt-2 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                در حال ارسال...
              </>
            ) : (
              'ثبت‌نام و ارسال ایمیل تأیید'
            )}
          </button>

          <p className="text-center text-sm text-slate-400">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link to="/login" className="font-bold text-cyan-300 hover:text-cyan-200">
              ورود
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
