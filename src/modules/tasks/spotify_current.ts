import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';

import { GetCurrentPlayingFromSpotify } from 'helpers/spotify';
import { SpotifyConfig } from 'modules/config';

const MS = 1000;

export async function SpotifyCurrentPlayingWatcher(): Promise<void> {
  if (!SpotifyConfig.IsConfigured) return;
  await GetCurrentPlayingFromSpotify();
}

export async function Activate(): Promise<void> {
  Log(`Starting task runner for watching spotify current playing [${MS} ms]`);
  SpotifyCurrentPlayingWatcher();
  setInterval(SpotifyCurrentPlayingWatcher, MS);
  return;
}
