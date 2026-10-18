import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CircleCheck, CircleX, LoaderCircle } from 'lucide-react';
import { confirmEmail } from '../lib/authApi';
import { ApiError } from '../lib/http';

type Status = 'loading' | 'success' | 'error';

const MISSING_TOKEN_MESSAGE = 'لینک تأیید ناقص است. لطفاً لینک را دقیقاً از ایمیل خود باز کنید.';

/** Target of the link in the confirmation email: /confirm-email?token=... */
export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  // The token is single-use: make sure React StrictMode's double effect run sends only one request.
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    confirmEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setMessage(err instanceof ApiError ? err.message : 'خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.');
        setStatus('error');
      });
  }, [token]);

  const view: Status = token ? status : 'error';
  const errorMessage = token ? message : MISSING_TOKEN_MESSAGE;

  return (
    <main className="lab-container pb-16 pt-28 lg:pt-36">
      <div
        className="lab-card mx-auto flex w-full max-w-xl animate-[heroSlideUp_0.6s_ease-out_both] flex-col items-center gap-5 p-8 text-center sm:p-10"
        aria-live="polite"
      >
        {view === 'loading' && (
          <>
            <LoaderCircle size={40} className="animate-spin text-cyan-300" aria-hidden="true" />
            <h1 className="text-xl font-black text-white">در حال تأیید ایمیل...</h1>
          </>
        )}

        {view === 'success' && (
          <>
            <CircleCheck size={48} className="text-emerald-400" aria-hidden="true" />
            <h1 className="text-2xl font-black text-white">ایمیل شما تأیید شد</h1>
            <p className="text-sm leading-8 text-slate-300">ثبت‌نام شما کامل شد و حساب کاربری‌تان ساخته شد. اکنون می‌توانید وارد شوید.</p>
            <Link to="/login" className="lab-button-primary">
              ورود به حساب
            </Link>
          </>
        )}

        {view === 'error' && (
          <>
            <CircleX size={48} className="text-red-400" aria-hidden="true" />
            <h1 className="text-2xl font-black text-white">تأیید ایمیل انجام نشد</h1>
            <p className="text-sm leading-8 text-slate-300">{errorMessage}</p>
            <p className="text-xs leading-7 text-slate-400">
              اگر پیش‌تر ایمیل خود را تأیید کرده‌اید، مستقیم وارد شوید؛ در غیر این صورت دوباره ثبت‌نام کنید.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register" className="lab-button-primary">
                ثبت‌نام دوباره
              </Link>
              <Link to="/login" className="lab-button-secondary">
                ورود
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
