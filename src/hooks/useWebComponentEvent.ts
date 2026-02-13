import { useEffect, useRef } from 'react';

/**
 * Workaround for chen-the-dawnstreak components missing onClick mapping.
 * Uses ref + addEventListener as recommended by mdui docs for React.
 *
 * The handler is stored in a ref so the listener doesn't need to be
 * re-attached on every render.
 */
export function useWebComponentEvent(
  ref: React.RefObject<HTMLElement | null>,
  event: string,
  handler: (e: Event) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const listener = (e: Event) => handlerRef.current(e);
    el.addEventListener(event, listener);
    return () => el.removeEventListener(event, listener);
  }, [ref, event]);
}
