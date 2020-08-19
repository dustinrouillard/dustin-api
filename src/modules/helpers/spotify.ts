import qs from 'querystring';

import { Fetch, RequestOptions } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';

import { SpotifyConfig, BaseURL } from 'config';
import { writeFileSync, readFileSync } from 'fs';

import { PlayerResponse, InternalPlayerResponse } from 'modules/interfaces/ISpotify';
import { CassandraClient, Types } from '@dustinrouillard/database-connectors/cassandra';
import { RedisClient } from '@dustinrouillard/database-connectors/redis';

export async function CheckForConfig(): Promise<void> {
  // Make sure we have a client id and secret
  if (!SpotifyConfig.Id || !SpotifyConfig.Secret) return Log(`Spotify is not setup fill out the environment variables for spotify`);

  // Check if the .spotify file exists
  if (!SpotifyConfig.IsConfigured) {
    // No config file
    Log(`Spotify is not setup yet, open this link in your browser`);
    Log(`${BaseURL}/spotify/authorize`);
    return;
  }
}

export function SpotifyAccount(): { access: string; refresh: string } {
  if (!SpotifyConfig.IsConfigured) throw { code: 'missing_spotify_config' };
  return JSON.parse(readFileSync('.config/.spotify').toString());
}

export function GetSpotifyAuthorization(): string {
  // Generate the authorization url for spotify
  const query = qs.stringify({
    response_type: 'code',
    client_id: SpotifyConfig.Id,
    scope: encodeURIComponent('user-read-playback-state user-read-currently-playing'),
    redirect_uri: `${BaseURL}/spotify/callback`
  });

  return `https://accounts.spotify.com/authorize?${query}`;
}

export async function SetupSpotify(code: string): Promise<void> {
  // Get the access token and refresh tokens from spotify
  const authorization_tokens = await Fetch('https://accounts.spotify.com/api/token', {
    method: 'post',
    headers: {
      authorization: `Basic ${Buffer.from(`${SpotifyConfig.Id}:${SpotifyConfig.Secret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${BaseURL}/spotify/callback`
    })
  });

  // Store the access and refresh token in the .spotify file
  if (authorization_tokens.access_token && authorization_tokens.refresh_token)
    writeFileSync('.config/.spotify', JSON.stringify({ access: authorization_tokens.access_token, refresh: authorization_tokens.refresh_token }));

  return;
}

export async function RegenerateTokens(): Promise<void> {
  // Get the refresh token for the account
  const refresh_token = SpotifyAccount().refresh;

  // Get the access token and refresh tokens from spotify using the refresh token
  const authorization_tokens = await Fetch('https://accounts.spotify.com/api/token', {
    method: 'post',
    headers: {
      authorization: `Basic ${Buffer.from(`${SpotifyConfig.Id}:${SpotifyConfig.Secret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({
      refresh_token,
      grant_type: 'refresh_token',
      redirect_uri: `${BaseURL}/spotify/callback`
    })
  });

  // Store the access and refresh token in the .spotify file
  if (authorization_tokens.access_token) writeFileSync('.config/.spotify', JSON.stringify({ access: authorization_tokens.access_token, refresh: refresh_token }));

  return;
}

async function RequestWrapper<T = never>(url: string, options: RequestOptions & { headers: { authorization?: string } }): Promise<T> {
  let request;
  request = await Fetch(url, options);
  if (request.error && request.error.status == 401 && request.error.message == 'The access token expired') {
    // Regenerate and re-run request;
    await RegenerateTokens();

    if (options.headers.authorization) options.headers.authorization = `Bearer ${SpotifyAccount().access}`;
    request = await Fetch(url, options);
  }
  return request;
}

export async function GetCurrentPlaying(): Promise<InternalPlayerResponse> {
  // Get current track data from spotify
  const current_track = await RequestWrapper<PlayerResponse>('https://api.spotify.com/v1/me/player?additional_types=episode', {
    headers: { authorization: `Bearer ${SpotifyAccount().access}` }
  });

  if (!['track', 'episode'].includes(current_track.currently_playing_type)) return { is_playing: false };

  if (current_track.is_playing) {
    return {
      is_playing: true,
      device_name: current_track.device.name,
      device_type: current_track.device.type,
      item_name: current_track.item.name,
      item_type: current_track.item.type,
      item_author: current_track.item.type == 'episode' ? current_track.item.show?.name : current_track.item.artists.map((artist) => artist.name).join(', '),
      item_id: current_track.item.id,
      item_image: current_track.item.type == 'episode' ? current_track.item.show?.images[0].url : current_track.item.album?.images[0].url,
      item_progress: current_track.progress_ms,
      item_length_ms: current_track.item.duration_ms,
      started_at: current_track.timestamp
    };
  } else return { is_playing: false };
}

export async function PlayingHistory(range: 'day' | 'week' | 'month'): Promise<{ history: Types.Row[]; cached?: string }> {
  // Check if a value exists in redis for the supplied range and use that instead
  if (await RedisClient.exists(`spotify/history/${range || 'day'}`)) return JSON.parse((await RedisClient.get(`spotify/history/${range || 'day'}`)) || '');

  let startDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  if (range == 'week') startDate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (range == 'month') startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));

  // Get end date (right now)
  const endDate = new Date();

  // Get entries from cassandra between the selected date range
  const tracks_history = await CassandraClient.execute(
    'SELECT item_name, item_author, item_type, device_name, device_type, date FROM spotify_song_history WHERE date >= ? AND date <= ? ALLOW FILTERING;',
    [startDate, endDate]
  );

  // Make sure there were rows returned
  if (tracks_history.rowLength <= 0) throw { code: 'no_tracks_in_that_range' };

  // Sort the tracks
  const sorted = tracks_history.rows.sort((a, b) => b.date - a.date);

  // Store in redis for 5 minutes
  await RedisClient.set(`spotify/history/${range || 'day'}`, JSON.stringify({ cached: new Date().toUTCString(), history: sorted }), 'ex', 300);

  return { history: sorted };
}

// Run the check for config function on start to load up the spotify details.
CheckForConfig();
