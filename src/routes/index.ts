import { FastifyInstance, RegisterOptions } from 'fastify';

import { Middleware } from '@dustinrouillard/fastify-security';

import { AuthorizeSpotify, CallbackSpotify } from 'handlers/spotify';
import { IncrementCommandCount, IncrementBuildCount, GetStatistics } from 'handlers/stats';

import { SpotifyConfig } from 'modules/config';

export function UnauthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions<{}, {}, {}>, next?: () => void): void {
  server.get('/stats', GetStatistics);

  if (!SpotifyConfig.IsConfigured) server.get('/spotify/authorize', AuthorizeSpotify);
  if (!SpotifyConfig.IsConfigured) server.get('/spotify/callback', CallbackSpotify);

  if (next) next();
}

export function AuthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions<{}, {}, {}>, next?: () => void): void {
  server.register(Middleware());
  server.post('/stats/track/commands', IncrementCommandCount);
  server.post('/stats/track/docker', IncrementBuildCount);

  if (next) next();
}
