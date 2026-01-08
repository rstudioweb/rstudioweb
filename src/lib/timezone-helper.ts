/**
 * Get current date in IST (Indian Standard Time / Kolkata timezone)
 * Returns YYYY-MM-DD format in IST
 */
export function getISTDate(): string {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const date = String(istTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

/**
 * Get current timestamp in IST
 * Returns ISO-like string but with IST timezone offset
 */
export function getISTTimestamp(): string {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  return istTime.toISOString().replace('Z', '+05:30');
}

/**
 * Convert any date to IST date string (YYYY-MM-DD)
 */
export function toISTDateString(date: Date): string {
  const istTime = new Date(date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format seconds to HH:MM:SS
 */
export function formatSeconds(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
