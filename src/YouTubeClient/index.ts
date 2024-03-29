import axios, { AxiosInstance } from 'axios';
import queryString from 'query-string';
import { parse } from 'tinyduration';
import {
  PlaylistInfoResponse,
  SearchRequest,
  SearchResponse,
  VideoInfoResponse,
} from './interfaces';

export class YouTubeClient {
  private apiKey: string;
  private api: AxiosInstance;

  constructor(key: string) {
    this.apiKey = key;
    this.api = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
    });
  }

  private async videoInfo(videoId: string): Promise<VideoInfoResponse> {
    const params = {
      key: this.apiKey,
      part: 'snippet,contentDetails',
      id: videoId,
    };

    const { data } = await this.api.get<VideoInfoResponse>(
      `/videos?${queryString.stringify(params)}`
    );
    const parsedDuration = parse(data.items[0].contentDetails.duration);

    let seconds = '00';
    if (parsedDuration.seconds)
      seconds =
        parsedDuration.seconds < 10 ? `0${parsedDuration.seconds}` : String(parsedDuration.seconds);

    data.items[0].contentDetails.duration = parsedDuration.hours
      ? `${parsedDuration.hours}:${parsedDuration.minutes}:${parsedDuration.seconds}`
      : `${parsedDuration.minutes || 0}:${seconds}`;

    return data;
  }

  public async search(request: SearchRequest): Promise<SearchResponse> {
    const params = {
      key: this.apiKey,
      ...request,
      part: 'snippet',
    };

    const response = await this.api.get<SearchResponse>(`/search?${queryString.stringify(params)}`);

    return response.data;
  }

  public async getVideoInfoById(videoId: string): Promise<VideoInfoResponse> {
    return await this.videoInfo(videoId);
  }

  public async getVideoInfoByUrl(url: string): Promise<VideoInfoResponse> {
    const parsedUrl = queryString.parseUrl(url);
    const videoId = parsedUrl.query['v'] as string;
    return await this.videoInfo(videoId);
  }

  public async getPlaylistInfo(url: string): Promise<PlaylistInfoResponse> {
    const parsedUrl = queryString.parseUrl(url);
    const playlistId = parsedUrl.query['list'];
    const params = {
      key: this.apiKey,
      part: 'snippet',
      maxResults: 50,
      playlistId,
    };

    let { data } = await this.api.get<PlaylistInfoResponse>(
      `/playlistItems?${queryString.stringify(params)}`
    );
    const playlists = data;

    while (data?.nextPageToken) {
      const response = await this.api.get<PlaylistInfoResponse>(
        `/playlistItems?${queryString.stringify({ ...params, pageToken: data.nextPageToken })}`
      );
      data = response.data;
      playlists.items.push(...data.items);
    }

    return playlists;
  }
}
