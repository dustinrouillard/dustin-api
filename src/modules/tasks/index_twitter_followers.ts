import { CronJob } from 'cron';

import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';

import { GetFollowers } from 'helpers/twitter';
import { TwitterUser, DatabaseTwitterUser } from 'modules/interfaces/ITwitter';
import { CassandraClient } from '@dustinrouillard/database-connectors/cassandra';
import { RedisClient } from '@dustinrouillard/database-connectors/redis';

const CRON = '*/20 * * * *';

async function GetCurrentFollowers(): Promise<DatabaseTwitterUser[]> {
  let Followers = (await RedisClient.exists('twitter/followers')) ? JSON.parse((await RedisClient.get('twitter/followers')) || '') : '';
  if (!Followers)
    Followers = (
      await CassandraClient.execute('SELECT id, username, name, verified, protected, image, banner, color, description, url, followers, following, statuses, likes, location FROM twitter_followers')
    ).rows;
  if (Followers) await RedisClient.set('twitter/followers', JSON.stringify(Followers), 'ex', 120);

  return Followers;
}

export async function PullTwitterFollowers(): Promise<void> {
  // Check last run time in redis before running this again to make sure it is more than 15 minutes
  const last_run = await RedisClient.get('tasks/twitter_followers/last_run');
  if (last_run) return;

  const twitter_followers = await GetFollowers();

  // Get all twitter followers we already have from cassandra or redis
  // const current_followers = await GetCurrentFollowers();

  // Filter out unfollowers
  // const unfollowers = current_followers.filter((cF) => !twitter_followers.some((tF) => cF.username == tF.screen_name));
  // if (unfollowers.length > 0) Debug(`Twitter : We found ${unfollowers.length.toLocaleString()} unfollowers`);

  const query = twitter_followers.map((user: TwitterUser) => {
    return {
      query:
        'INSERT INTO twitter_followers (id, username, name, verified, protected, image, banner, color, description, url, followers, following, statuses, likes, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [
        user.id.toString(),
        user.screen_name,
        user.name,
        user.verified,
        user.protected,
        user.profile_image_url_https,
        user.profile_banner_url,
        user.profile_background_color,
        user.description,
        user.url,
        user.followers_count,
        user.friends_count,
        user.statuses_count,
        user.favourites_count,
        user.location
      ]
    };
  });

  const all_queries = [];
  while (query.length > 0) all_queries.push(query.splice(0, 50));

  for (const queries of all_queries) {
    await CassandraClient.batch(queries);
  }

  await RedisClient.set('tasks/twitter_followers/last_run', Date.now(), 'ex', 900);
}

export async function Activate(): Promise<void> {
  const Job = new CronJob(CRON, PullTwitterFollowers, null, true, 'America/Los_Angeles');
  Log(`Starting task runner for pulling twitter followers [${CRON}]`);
  PullTwitterFollowers();
  Job.start();
  return;
}
