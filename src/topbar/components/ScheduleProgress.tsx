import { useRef, useEffect } from 'react';
import { LinearProgress } from 'chen-the-dawnstreak';
import { useScheduleDisplay } from '../hooks/useScheduleDisplay';

export default function ScheduleProgress() {
  const { displayText, progress, isBreakTime } = useScheduleDisplay();
  const progressRef = useRef<HTMLElement>(null);

  // Update CSS custom property for text mask effect
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fillPx = rect.width * progress;
    el.style.setProperty('--progress-fill-px', `${fillPx}px`);
  }, [progress]);

  // Auto-resize progress bar width based on text
  useEffect(() => {
    const el = progressRef.current;
    if (!el || !displayText) return;

    const span = document.createElement('span');
    span.textContent = displayText;
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    span.style.fontSize = '1rem';
    span.style.fontWeight = '500';
    document.body.appendChild(span);
    const widthPx = span.getBoundingClientRect().width;
    document.body.removeChild(span);

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const widthRem = widthPx / rootFontSize;
    const paddedRem = widthRem + 1;
    el.style.width = `${Math.min(24, Math.max(4, paddedRem))}rem`;
  }, [displayText]);

  return (
    <LinearProgress
      ref={progressRef}
      className={`schedule-progress${isBreakTime ? ' break-time' : ''}`}
      value={progress}
      data-text={displayText}
    />
  );
}
