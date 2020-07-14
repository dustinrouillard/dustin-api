import { Activate as LogSpotifyListenHistory } from './spotify_listening_history';
// import { Activate as PullTwitterFollowers } from './index_twitter_followers';
// import { Activate as GetDevelopmentHours } from './development_hours';
// import { Activate as UpdateStatisticsGist } from './update_gist';
// import { Activate as UpdateGitHubReadme } from './update_readme';

import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';

(async (): Promise<void> => {
  setTimeout(async () => {
    if (process.env.NODE_ENV == 'development') return Log('Ignoring task runners as we are in development');
    else Log('Starting task runners');

    // TODO: Move to a seperate deployment for only tasks (because it's seconds I cannot use cron ;( )
    await LogSpotifyListenHistory();
    // await PullTwitterFollowers(); CRONED
    // await GetDevelopmentHours(); CRONED
    // await UpdateStatisticsGist(); CRONED
    // await UpdateGitHubReadme(); CRONED
  }, 1000);
})();
