export function formatLapTime(seconds) {
  if (!seconds && seconds !== 0) return '—';
  if (typeof seconds === 'string') return seconds;
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  if (mins > 0) {
    return `${mins}:${secs.padStart(6, '0')}`;
  }
  return secs;
}

export function formatGap(gap) {
  if (!gap && gap !== 0) return '—';
  if (typeof gap === 'string') return gap;
  if (gap === 0) return 'INTERVAL';
  return `+${gap.toFixed(3)}`;
}

export function formatDriverNumber(num) {
  if (!num && num !== 0) return '00';
  return String(num).padStart(2, '0');
}

export function getCountdown(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function formatSessionTime(dateStr, timezone) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  try {
    return date.toLocaleString('en-GB', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
