import dotenv from 'dotenv';
import { existsSync } from 'fs';
dotenv.config();

export const BaseURL = process.env.BASE_URL || 'http://127.0.0.1:1300';
export const PortConfig = Number(process.env.PORT) || 1300;

export const GithubConfig = {
  Username: process.env.GITHUB_USERNAME || '',
  Gist: process.env.GITHUB_GIST || '',
  Filename: process.env.GITHUB_FILENAME || 'Statistics',
  Token: process.env.GITHUB_TOKEN || '',
};

export const WakatimeConfig = {
  User: process.env.WAKATIME_USER || '',
  Id: process.env.WAKATIME_ID || '',
};

export const TwitterConfig = {
  Username: process.env.TWITTER_USERNAME || '',
  ApiKey: process.env.TWITTER_API_KEY || '',
  Secret: process.env.TWITTER_API_SECRET || '',
  IsConfigured: existsSync('.twitter'),
};

export const SpotifyConfig = {
  Id: process.env.SPOTIFY_CLIENT_ID || '',
  Secret: process.env.SPOTIFY_CLIENT_SECRET || '',
  IsConfigured: existsSync('.spotify'),
};
