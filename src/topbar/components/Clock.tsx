import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(formatClock());

  useEffect(() => {
    const timer = setInterval(() => setTime(formatClock()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span style={{ fontSize: '1.2rem', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
      {time}
    </span>
  );
}

function formatClock(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}
