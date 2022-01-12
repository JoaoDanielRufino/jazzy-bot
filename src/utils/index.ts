import { SongInfo } from '../MusicPlayer';
import { VideoInfoResponse } from '../YouTubeClient/interfaces';
import { decode } from 'html-entities';

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

export function parseVideoInfo(videoInfo: VideoInfoResponse): SongInfo {
  const url = `https://youtube.com/watch?v=${videoInfo.items[0].id}`;
  const title = decode(videoInfo.items[0].snippet.title);
  const thumbnail = videoInfo.items[0].snippet.thumbnails.default.url;
  const duration = videoInfo.items[0].contentDetails.duration;

  return { url, title, thumbnail, duration };
}
