import { FastifyInstance, RegisterOptions } from 'fastify';

import { Middleware } from '@dustinrouillard/fastify-security';

import { GetRoutes } from 'handlers/base';
import { AuthorizeSpotify, CallbackSpotify, CurrentPlaying, GetSpotifyHistory } from 'handlers/spotify';
import { IncrementCommandCount, IncrementBuildCount, GetStatistics } from 'handlers/stats';
import { UploadFileHandler, UploadImageHandler } from 'handlers/upload';
import { SetSleepingStatus, GetCurrentState } from 'handlers/state';
import { HealthCheck } from 'handlers/health';
import { RunTask } from 'handlers/tasks';

import { SpotifyConfig } from 'modules/config';

export function UnauthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions, next?: () => void): void {
  // Base routes
  server.get('/', GetRoutes);
  server.get('/stats', GetStatistics);
  server.get('/state', GetCurrentState);

  // Health check
  server.get('/health', HealthCheck);

  // Spotify related routes
  server.get('/spotify', CurrentPlaying);
  server.get('/spotify/history', GetSpotifyHistory);
  if (!SpotifyConfig.IsConfigured) server.get('/spotify/authorize', AuthorizeSpotify);
  if (!SpotifyConfig.IsConfigured) server.get('/spotify/callback', CallbackSpotify);

  if (next) next();
}

export function AuthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions, next?: () => void): void {
  server.register(Middleware());
  // Stats routes
  server.post('/stats/track/commands', IncrementCommandCount);
  server.post('/stats/track/docker', IncrementBuildCount);

  // State routes
  server.post('/state/sleeping', SetSleepingStatus);

  // Uplaoder routes
  server.post('/upload/image', UploadImageHandler);
  server.post('/upload/file', UploadFileHandler);

  if (next) next();
}

export function TaskRoutes(server: FastifyInstance, _options: RegisterOptions, next?: () => void): void {
  server.register(Middleware());
  server.post('/tasks/:task_name', RunTask);

  if (next) next();
}
