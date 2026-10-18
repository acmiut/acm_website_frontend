import { useEffect, useState } from 'react';

/** Counts down whole seconds from `initialSeconds`; call `start(n)` to restart. */
export function useCountdown(initialSeconds = 0) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.ceil(initialSeconds)));
  const active = remaining > 0;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);

  const start = (seconds: number) => setRemaining(Math.max(0, Math.ceil(seconds)));

  return { remaining, start };
}
