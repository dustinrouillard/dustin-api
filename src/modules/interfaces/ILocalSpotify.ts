export interface SpotifyAuthor {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  image?: string;
}

export interface ArtistItem {
  id: string;
  name: string;
  image: string;
  genres: string[];
  popularity: number;
  followers: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album?: SpotifyAlbum;
  artist?: (SpotifyAuthor | ArtistItem | string)[];
  type: string;
  explicit: boolean;
  duration: number;
}
