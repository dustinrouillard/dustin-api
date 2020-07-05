import dotenv from 'dotenv';
dotenv.config();

export const PortConfig = Number(process.env.PORT) || 1300;

export const GithubConfig = {
  Gist: process.env.GITHUB_GIST || '',
  Filename: process.env.GITHUB_FILENAME || 'Statistics',
  Token: process.env.GITHUB_TOKEN || '',
};

export const WakatimeConfig = {
  User: process.env.WAKATIME_USER || '',
  Id: process.env.WAKATIME_ID || '',
};

export const SpotifyConfig = {
  Id: process.env.SPOTIFY_CLIENT_ID || '',
  Secret: process.env.SPOTIFY_CLIENT_SECRET || '',
};
