import { FastifyInstance } from 'fastify';
import { permitted } from './middlewares/permitted.js';
import { uploadFile } from './methods/files/upload-file.js';

import { authorizeSpotify } from './methods/spotify/authorize-spotify.js';
import { getCurrentPlaying } from './methods/spotify/get-current-playing.js';
import { setupSpotify } from './methods/spotify/setup-spotify.js';
import { getRecentPlays } from './methods/spotify/get-recents.js';

function protectedRoutes(server: FastifyInstance, _options: any, next: any) {
  server.register(permitted);

  server.post('/:type/upload', uploadFile);

  next();
}

export function routes(server: FastifyInstance, _options: any, next: any) {
  server.register(protectedRoutes);

  server.get('/spotify', getCurrentPlaying);
  server.get('/spotify/recents', getRecentPlays);
  server.get('/spotify/authorize', authorizeSpotify);
  server.get('/spotify/setup', setupSpotify);

  next();
}
