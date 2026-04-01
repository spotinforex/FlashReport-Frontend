export interface Article {
  article_id: string;
  title: string;
  url: string;
  source: string;
  credibility_score: number;
  published_at: string;
}

export interface Analysis {
  alert: boolean;
  escalation: boolean;
  brief: string;
}

export interface Event {
  event_id: string;
  event_type: string;
  title: string;
  location: string;
  state: string;
  severity: string;
  confidence: number;
  status: string;
  first_detected: string;
  last_updated: string;
  analysis: Analysis;
  image_urls: string[];
  articles: Article[];
}

export interface EventsResponse {
  count: number;
  events: Event[];
}

export interface SearchResponse {
  keyword: string;
  location: string | null;
  count: number;
  events: Event[];
}
