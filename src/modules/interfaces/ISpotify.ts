export interface PlayerResponse {
  device: Device;
  shuffle_state: boolean;
  repeat_state: string;
  timestamp: number;
  context: Context;
  progress_ms: number;
  item: Item;
  currently_playing_type: string;
  is_playing: boolean;
}

export interface Context {
  external_urls: ExternalUrls;
  href: string;
  type: string;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface Item {
  album: Album;
  show?: Show;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface Show {
  description: string;
  id: string;
  languages: string[];
  media_type: string;
  href: string;
  uri: string;
  total_episodes: number;
  available_markets: string[];
  is_externally_hosted: boolean;
  explicit: boolean;
  publisher: string;
  type: string;
  images: Image[];
  external_urls: ExternalUrls;
  name: string;
}

export interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface Artist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

export interface InternalPlayerResponse {
  is_playing: boolean;
  device_name?: string;
  device_type?: string;
  item_name?: string;
  item_author?: string;
  item_type?: string;
  item_id?: string;
  item_image?: string;
  item_progress?: number;
  item_length_ms?: number;
  started_at?: number;
}

export interface DatabaseSpotifyHistory {
  device_name: string;
  device_type: string;
  item_name: string;
  item_author: string;
  item_type: string;
  item_id: string;
  item_image: string;
  item_length_ms: number;
  date: Date;
}
