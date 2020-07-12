import { Activate as LogSpotifyListenHistory } from './spotify_listening_history';
import { Activate as PullTwitterFollowers } from './index_twitter_followers';
import { Activate as GetDevelopmentHours } from './development_hours';
import { Activate as UpdateStatisticsGist } from './update_gist';
import { Activate as UpdateGitHubReadme } from './update_readme';

import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';

(async (): Promise<void> => {
  setTimeout(async () => {
    if (process.env.NODE_ENV == 'development') return Log('Ignoring task runners as we are in development');
    else Log('Starting task runners');

    await LogSpotifyListenHistory();
    await PullTwitterFollowers();
    await GetDevelopmentHours();
    await UpdateStatisticsGist();
    await UpdateGitHubReadme();
  }, 500);
})();
