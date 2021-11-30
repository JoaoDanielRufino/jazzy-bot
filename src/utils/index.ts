export function convertToMinutes(seconds: string) {
  const intSeconds = parseInt(seconds);
  const minutes = Math.floor(intSeconds / 60);
  const remainingSeconds = intSeconds - minutes * 60;
  const stringRemainingSeconds = remainingSeconds.toString();

  return stringRemainingSeconds.length > 1
    ? `${minutes}:${stringRemainingSeconds}`
    : `${minutes}:0${stringRemainingSeconds}`;
}
