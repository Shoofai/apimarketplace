/**
 * Format a date as relative time (e.g. "5 minutes ago").
 * Replaces date-fns formatDistanceToNow to avoid extra dependency.
 */
export function formatDistanceToNow(date: Date | string, options?: { addSuffix?: boolean }): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const addSuffix = options?.addSuffix !== false;

  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;

  if (diffSec < 60) {
    value = -diffSec;
    unit = 'second';
  } else if (diffMin < 60) {
    value = -diffMin;
    unit = 'minute';
  } else if (diffHr < 24) {
    value = -diffHr;
    unit = 'hour';
  } else if (diffDay < 30) {
    value = -diffDay;
    unit = 'day';
  } else {
    return d.toLocaleDateString();
  }

  const s = rtf.format(value, unit);
  return addSuffix ? s : s.replace(/^in | ago$/g, '').trim();
}
