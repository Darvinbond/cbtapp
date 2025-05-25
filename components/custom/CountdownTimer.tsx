// components/CountdownTimer.tsx
import { useEffect, useRef, useState } from 'react';

interface CountdownTimerProps {
  /** How many minutes from “now” the timer should run */
  minutes: number;
  /** Called exactly once when the timer hits 00 : 00 : 00 */
  onAfterCountdown?: () => void;
}

export default function CountdownTimer({
  minutes,
  onAfterCountdown,
}: CountdownTimerProps) {
  /** epoch milliseconds when the timer should finish */
  const deadlineRef = useRef<number>(Date.now() + minutes * 60_000);
  /** remaining time in seconds */
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)),
  );
  /** guard so we call the callback only once */
  const calledRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        return next >= 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(id); // cleanup on unmount
  }, []);

  // call the callback exactly once when remaining hits 0
  useEffect(() => {
    if (remaining === 0 && !calledRef.current) {
      calledRef.current = true;
      onAfterCountdown?.();
    }
  }, [remaining, onAfterCountdown]);

  // derived h : m : s
  const hours = Math.floor(remaining / 3600)
    .toString()
    .padStart(2, '0');
  const minutesLeft = Math.floor((remaining % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');

  return (
    <div
      aria-live="polite"
      className='text-[16px] font-semibold text-red-700'
    >
      {hours}:{minutesLeft}:{seconds}
    </div>
  );
}
