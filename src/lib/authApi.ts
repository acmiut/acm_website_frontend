import { postJson } from './http';
import type { RegisterPayload } from './validation';

export interface SendResult {
  /** seconds until another confirmation email may be requested */
  resendAfterSeconds: number;
}

/** Step 1: stores the sign-up as "pending" and emails a confirmation link. No account exists yet. */
export const registerUser = (payload: RegisterPayload) => postJson<SendResult>('/api/auth/register', payload);

export const resendConfirmation = (email: string) => postJson<SendResult>('/api/auth/resend-confirmation', { email });

/** Step 2: called by the page the email link opens. The account is created only now. */
export const confirmEmail = (token: string) => postJson<unknown>('/api/auth/confirm-email', { token });
