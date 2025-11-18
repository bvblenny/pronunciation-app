/**
 * Format milliseconds to MM:SS format
 * @param ms Time in milliseconds (or seconds if < 1000)
 * @returns Formatted time string
 */
export function formatMs(ms: number | string): string {
  const n = Number(ms);
  if (!isFinite(n) || n < 0) return '0:00';
  // support seconds inputs by converting values < 1000 (and >0) to ms
  const msVal = n > 0 && n < 1000 ? n * 1000 : n;
  const totalSec = Math.floor(msVal / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Split text into individual words
 * @param text Text to split
 * @returns Array of words
 */
export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(w => w.length > 0);
}

