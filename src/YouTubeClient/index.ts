import axios, { AxiosInstance } from 'axios';
import queryString from 'query-string';
import { parse } from 'tinyduration';
import { SearchRequest, SearchResponse, VideoInfoResponse } from './interfaces';

export class YouTubeClient {
  private apiKey: string;
  private api: AxiosInstance;

  constructor(key: string) {
    this.apiKey = key;
    this.api = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
    });
  }

  public async search(request: SearchRequest) {
    const params = {
      key: this.apiKey,
      ...request,
      part: 'snippet',
    };

    const response = await this.api.get<SearchResponse>(`/search?${queryString.stringify(params)}`);

    return response.data;
  }

  public async videoInfo(videoId: string) {
    const params = {
      key: this.apiKey,
      part: 'contentDetails',
      id: videoId,
    };

    const response = await this.api.get<VideoInfoResponse>(
      `/videos?${queryString.stringify(params)}`
    );

    const { data } = response;
    const parsedDuration = parse(data.items[0].contentDetails.duration);

    data.items[0].contentDetails.duration = parsedDuration.hours
      ? `${parsedDuration.hours}:${parsedDuration.minutes}:${parsedDuration.seconds}`
      : `${parsedDuration.minutes}:${parsedDuration.seconds}`;

    return data;
  }
}
