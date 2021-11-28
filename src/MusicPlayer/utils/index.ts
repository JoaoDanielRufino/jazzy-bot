import { getInfo } from 'ytdl-core';
import { convertToMinutes } from '../../utils';

export function shuffle(arr: Array<any>) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function randomIndex(arr: Array<any>) {
  return Math.floor(Math.random() * arr.length);
}

export async function getSongInfo(url: string) {
  const info = await getInfo(url);
  const title = info.videoDetails.title;
  const thumbnail = info.videoDetails.thumbnails[0].url;
  const duration = convertToMinutes(info.videoDetails.lengthSeconds);

  return { url, title, thumbnail, duration };
}
