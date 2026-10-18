/** Value for aria-describedby: points at the hint and/or error paragraph rendered by <FormField>. */
export const describedBy = (id: string, hasError: boolean, hasHint: boolean): string | undefined => {
  const ids = [hasError ? `${id}-error` : '', hasHint ? `${id}-hint` : ''].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
};
