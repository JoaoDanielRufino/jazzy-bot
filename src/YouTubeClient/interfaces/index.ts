interface Thumbnails {
  default: {
    url: string;
    width: number;
    height: number;
  };
  medium: {
    url: string;
    width: number;
    height: number;
  };
  hight: {
    url: string;
    width: number;
    height: number;
  };
}

interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
}

interface SearchItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: Snippet;
}

interface ContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  projection: string;
}

interface VideoInfoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
  contentDetails: ContentDetails;
}

export interface SearchRequest {
  q: string;
  maxResults: number;
  type?: 'channel' | 'playlist' | 'video';
}

export interface SearchResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageinfo: {
    totalresults: number;
    resultsperpage: number;
  };
  items: SearchItem[];
}

export interface VideoInfoResponse {
  kind: string;
  etag: string;
  items: VideoInfoItem[];
  pageinfo: {
    totalresults: number;
    resultsperpage: number;
  };
}
