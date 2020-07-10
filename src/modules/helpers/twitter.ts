import qs from 'querystring';

import { Fetch, RequestOptions } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log, Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { TwitterConfig } from 'config';
import { writeFileSync, readFileSync } from 'fs';
import { FollowersListResponse, TwitterUser } from 'modules/interfaces/ITwitter';
// import { RedisClient } from '@dustinrouillard/database-connectors/redis';

export function TwitterAccount(): { access: string } {
  if (!TwitterConfig.IsConfigured) throw { code: 'missing_twitter_config' };
  return JSON.parse(readFileSync('.twitter').toString());
}

export async function GenerateToken(): Promise<void> {
  // Get the access token and refresh tokens from spotify using the refresh token
  const authorization_tokens = await Fetch('https://api.twitter.com/oauth2/token', {
    method: 'post',
    headers: {
      authorization: `Basic ${Buffer.from(`${TwitterConfig.ApiKey}:${TwitterConfig.Secret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({ grant_type: 'client_credentials' })
  });

  // Store the access and refresh token in the .spotify file
  if (authorization_tokens.access_token) writeFileSync('.twitter', JSON.stringify({ access: authorization_tokens.access_token }));

  return;
}

export async function CheckForConfig(): Promise<void> {
  // Make sure we have a client id and secret
  if (!TwitterConfig.ApiKey || !TwitterConfig.Secret) return Log(`Twitter is not setup fill out the environment variables for twitter`);

  // Check if the .spotify file exists
  if (!TwitterConfig.IsConfigured) {
    Log('Twitter is not setup yet, generating token...');
    GenerateToken();
    return;
  }
}

async function RequestWrapper<T = never>(url: string, options: RequestOptions & { headers: { authorization?: string } }): Promise<T> {
  let request;
  request = await Fetch(url, options);
  if (request.error && request.error.status == 401 && request.error.message == 'The access token expired') {
    // Regenerate and re-run request;
    await GenerateToken();

    if (options.headers.authorization) options.headers.authorization = `Bearer ${TwitterAccount().access}`;
    request = await Fetch(url, options);
  }
  return request;
}

async function CheckRatelimit(): Promise<boolean> {
  const ratelimit_status = await RequestWrapper<{ resources: { followers: { [key: string]: { limit: number; remaining: number; reset: number } } } }>(
    'https://api.twitter.com/1.1/application/rate_limit_status.json',
    {
      headers: { authorization: `Bearer ${TwitterAccount().access}` }
    }
  );

  const { remaining } = ratelimit_status.resources.followers['/followers/list'];

  Debug('Twitter : Remaining ratelimit', remaining);

  if (remaining <= 0) return false;
  return true;
}

export async function GetFollowers(cursor?: number): Promise<TwitterUser[]> {
  // TODO: Debugging code that I won't remove and will add a toggle to for later
  // if (await RedisClient.exists('twitter/raw')) return JSON.parse((await RedisClient.get('twitter/raw')) || '');

  // Check rate limit for getting followers
  const check_rate_limit = await CheckRatelimit();
  if (!check_rate_limit) throw { code: 'rate_limited' };

  const followers_count = await RequestWrapper<FollowersListResponse>(
    `https://api.twitter.com/1.1/followers/list.json?screen_name=${TwitterConfig.Username}&count=200&include_user_entities=false&skip_status=true${cursor ? `&cursor=${cursor.toString()}` : ''}`,
    {
      headers: { authorization: `Bearer ${TwitterAccount().access}` }
    }
  );

  let total_followers = [...followers_count.users];
  // If we have 200 check for cursor and try making the request again
  if (followers_count.users.length >= 200 && followers_count.next_cursor) total_followers = [...total_followers, ...(await GetFollowers(followers_count.next_cursor))];

  // TODO: Debugging code, not removing need later will add toggle
  // await RedisClient.set('twitter/raw', JSON.stringify(total_followers), 'ex', 900);

  return total_followers;
}

// Run the check for config function on start to load up the spotify details.
CheckForConfig();
