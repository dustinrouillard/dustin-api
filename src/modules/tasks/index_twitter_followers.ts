import { CronJob } from 'cron';

import { Fetch } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log, Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { GetFollowers } from 'helpers/twitter';
import { TwitterUser } from 'modules/interfaces/ITwitter';
import { CassandraClient } from '@dustinrouillard/database/cassandra';
import { RedisClient } from '@dustinrouillard/database/redis';

const CRON = '*/20 * * * *';

async function PullTwitterFollowers(): Promise<void> {
  // Check last run time in redis before running this again to make sure it is more than 15 minutes
  const last_run = await RedisClient.get('tasks/twitter_followers/last_run');
  if (last_run) return;

  const twitter_followers = await GetFollowers();

  const query = twitter_followers.map((user: TwitterUser) => {
    return {
      query:
        'INSERT INTO twitter_followers (user_id, username, name, verified, protected, image, banner, color, description, url, followers, following, statuses, likes, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [
        user.id,
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
        user.location,
      ],
    };
  });

  const all_queries = [];
  while (query.length > 0) all_queries.push(query.splice(0, 50));

  for (const queries of all_queries) {
    await CassandraClient.batch(queries);
  }

  await RedisClient.set('tasks/twitter_followers/last_run', Date.now(), 'ex', 900);
}

const Job = new CronJob(CRON, PullTwitterFollowers, null, true, 'America/Los_Angeles');

(async (): Promise<void> => {
  Log(`Starting task runner for pulling twitter followers [${CRON}]`);
  PullTwitterFollowers();
  Job.start();
})();
