import axios from 'axios';
import queryString from 'query-string';
import { SearchRequest, SearchResponse } from './interfaces';

export class YouTubeClient {
  private readonly URL = 'https://www.googleapis.com/youtube/v3';
  private apiKey: string;

  constructor(key: string) {
    this.apiKey = key;
  }

  public async search(request: SearchRequest) {
    const params = {
      key: this.apiKey,
      ...request,
      part: 'snippet',
    };

    const response = await axios.get<SearchResponse>(
      `${this.URL}/search?${queryString.stringify(params)}`
    );

    return response.data;
  }
}
