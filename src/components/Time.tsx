'use client';

function Time({ date }: { date: number }) {
  const resetDate = new Date(date);
  const resetAfter = resetDate.toLocaleString('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour12: true,
  });
  return <time dateTime={resetDate.toISOString()}> {resetAfter}</time>;
}

export default Time;
