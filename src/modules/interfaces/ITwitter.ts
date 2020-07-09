export interface TwitterUser {
  id: number;
  name: string;
  screen_name: string;
  location?: string;
  url?: string;
  description: string;
  protected: boolean;
  followers_count: number;
  friends_count: number;
  created_at: string;
  favourites_count: number;
  verified: boolean;
  statuses_count: number;
  profile_background_color: string;
  profile_background_image_url_https?: string;
  profile_background_tile: boolean;
  profile_image_url_https: string;
  profile_banner_url: string;
}

export interface FollowersListResponse {
  users: TwitterUser[];
  next_cursor: number;
  previous_cursor: number;
  total_count: null;
}

export interface DatabaseTwitterUser {
  id: string;
  user_id: string;
  username: string;
  name: string;
  url: string;
  verified: boolean;
  protected: boolean;
  image: string;
  banner: string;
  color: string;
  description: string;
  followers: number;
  following: number;
  statuses: number;
  likes: number;
  location: string;
}
