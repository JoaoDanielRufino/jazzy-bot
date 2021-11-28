export function convertToMinutes(seconds: string) {
  const intSeconds = parseInt(seconds);
  const minutes = Math.floor(intSeconds / 60);
  const remainingSeconds = intSeconds - minutes * 60;

  return `${minutes}:${remainingSeconds}`;
}
