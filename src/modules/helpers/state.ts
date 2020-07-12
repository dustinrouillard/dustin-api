import { RedisClient } from '@dustinrouillard/database-connectors/redis';

import { UpdateGitHubReadme } from 'modules/tasks/update_readme';

export async function SetSleepingState(sleeping: boolean): Promise<boolean> {
  // Set in redis the sleeping state
  await RedisClient.set('state/sleeping', sleeping.toString());
  UpdateGitHubReadme();
  return sleeping;
}

export async function GetSleepingState(): Promise<boolean> {
  // Set in redis the sleeping state
  const sleeping = await RedisClient.get('state/sleeping');
  if (!sleeping) return false;
  return sleeping == 'true';
}
