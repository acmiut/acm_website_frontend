import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import toast from 'react-hot-toast';
import { LoaderCircle, MailCheck } from 'lucide-react';
import { resendConfirmation } from '../lib/authApi';
import { ApiError } from '../lib/http';
import { useCountdown } from '../lib/useCountdown';

interface CheckEmailState {
  email?: string;
  resendAfterSeconds?: number;
}

export default function CheckEmailPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as CheckEmailState;
  const email = state.email;

  const { remaining, start } = useCountdown(state.resendAfterSeconds ?? 60);
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Opened directly (or refreshed): there is no sign-up in progress to talk about.
  if (!email) return <Navigate to="/register" replace />;

  const handleResend = async () => {
    if (sending || remaining > 0) return;
    setSending(true);
    try {
      const result = await resendConfirmation(email);
      start(result.resendAfterSeconds);
      toast.success('ایمیل تأیید دوباره ارسال شد.');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) setNotFound(true);
        if (err.retryAfterSeconds) start(err.retryAfterSeconds);
        toast.error(err.message);
      } else {
        toast.error('خطای غیرمنتظره‌ای رخ داد.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="lab-container pb-16 pt-28 lg:pt-36">
      <div className="lab-card mx-auto flex w-full max-w-xl animate-[heroSlideUp_0.6s_ease-out_both] flex-col items-center gap-5 p-8 text-center sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300">
          <MailCheck size={32} aria-hidden="true" />
        </span>

        <h1 className="text-2xl font-black text-white">ایمیل خود را بررسی کنید</h1>

        <p className="text-sm leading-8 text-slate-300">
          یک ایمیل تأیید به آدرس زیر ارسال شد. روی لینک داخل آن کلیک کنید تا ثبت‌نام شما کامل شود.
        </p>

        <bdi dir="ltr" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white">
          {email}
        </bdi>

        <p className="text-xs leading-7 text-slate-400">
          تا زمانی که ایمیل را تأیید نکنید، حسابی ساخته نمی‌شود. لینک ۲۴ ساعت اعتبار دارد. اگر ایمیل را نمی‌بینید، پوشه‌ی
          هرزنامه (Spam) را هم نگاه کنید.
        </p>

        {notFound ? (
          <Link to="/register" className="lab-button-primary">
            ثبت‌نام دوباره
          </Link>
        ) : (
          <button type="button" className="lab-button-secondary" onClick={handleResend} disabled={sending || remaining > 0}>
            {sending && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {remaining > 0 ? `ارسال دوباره ایمیل (${remaining} ثانیه)` : 'ارسال دوباره ایمیل'}
          </button>
        )}

        <Link to="/register" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">
          ایمیل را اشتباه وارد کرده‌اید؟ بازگشت به فرم
        </Link>
      </div>
    </main>
  );
}
