/**
 * Tiny fetch wrapper for the backend JSON API.
 * - In development, leave VITE_API_BASE_URL empty: Vite proxies /api to the backend (see vite.config.ts).
 * - In production, set VITE_API_BASE_URL to the backend origin (and add the frontend origin to the backend's Cors:AllowedOrigins).
 */
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  /** field name (camelCase) -> first error message */
  fieldErrors: Record<string, string>;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const NETWORK_ERROR_MESSAGE = 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.';
const GENERIC_ERROR_MESSAGE = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';

const lowerFirst = (s: string): string => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

const extractFieldErrors = (errors: unknown): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!errors || typeof errors !== 'object') return result;

  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const message = Array.isArray(value) ? value.find((v) => typeof v === 'string') : value;
    if (typeof message === 'string' && message) result[lowerFirst(key)] = message;
  }
  return result;
};

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }
  const payload = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;

  if (!response.ok) {
    const fieldErrors = extractFieldErrors(payload.errors);
    const message =
      (typeof payload.message === 'string' && payload.message) ||
      Object.values(fieldErrors)[0] ||
      GENERIC_ERROR_MESSAGE;

    const headerRetry = Number(response.headers.get('Retry-After'));
    const retryAfterSeconds =
      typeof payload.retryAfterSeconds === 'number'
        ? payload.retryAfterSeconds
        : Number.isFinite(headerRetry) && headerRetry > 0
          ? headerRetry
          : undefined;

    throw new ApiError(message, response.status, fieldErrors, retryAfterSeconds);
  }

  return payload as T;
}
