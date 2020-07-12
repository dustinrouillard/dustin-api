import { RedisClient } from '@dustinrouillard/database-connectors/redis';

import { UpdateGitHubReadme } from 'modules/tasks/update_readme';
import { GetDevelopmentHours } from 'modules/tasks/development_hours';
import { PullTwitterFollowers } from 'modules/tasks/index_twitter_followers';
import { UpdateStatisticsGist } from 'modules/tasks/update_gist';
import { LogSpotifyListenHistory } from 'modules/tasks/spotify_listening_history';

const tasks: { [key: string]: () => Promise<void> } = {
  github_readme: UpdateGitHubReadme,
  development_hours: GetDevelopmentHours,
  twitter_followers: PullTwitterFollowers,
  github_gist: UpdateStatisticsGist,
  spotify_listening: LogSpotifyListenHistory
};

export async function ExecuteTask(task_name: string): Promise<boolean> {
  const task = tasks[task_name];
  if (!task) throw { code: 'invalid_task' };

  // Run the task
  await task();

  return true;
}
