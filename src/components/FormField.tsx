import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}

export default function FormField({ id, label, error, hint, optional, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-bold text-slate-200">
        {label}
        {optional && <span className="ms-2 text-xs font-normal text-slate-500">(اختیاری)</span>}
      </label>

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs leading-6 text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs leading-6 text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
