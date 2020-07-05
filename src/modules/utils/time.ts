export function FormatSeconds(seconds: number): string {
  const hours = seconds / 3600;
  return `${hours.toFixed(2)}hrs`;
}
