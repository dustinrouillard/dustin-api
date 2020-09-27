import { FastifyInstance, RegisterOptions } from 'fastify';

import { Middleware } from '@dustinrouillard/fastify-security';

import { GetRoutes } from 'handlers/base';
import { AuthorizeSpotify, CallbackSpotify, CurrentPlaying, GetSpotifyHistory, GetTopArtist, GetTopTrack } from 'handlers/spotify';
import { IncrementCommandCount, IncrementBuildCount, GetStatistics } from 'handlers/stats';
import { UploadFileHandler, UploadImageHandler } from 'handlers/upload';
import { SetSleepingStatus, GetCurrentState } from 'handlers/state';
// import { SetAtLocation, GetLocationData } from 'handlers/location';
import { HealthCheck } from 'handlers/health';
import { RunTask } from 'handlers/tasks';

import { ModulesDisabled, SpotifyConfig } from 'modules/config';

export function UnauthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions, next?: () => void): void {
  // Base routes
  server.get('/', GetRoutes);
  if (!ModulesDisabled.STATS) server.get('/stats', GetStatistics);
  if (!ModulesDisabled.STATE) server.get('/state', GetCurrentState);

  // // Location
  // server.get('/location', GetLocationData);

  // Health check
  server.get('/health', HealthCheck);

  // Spotify related routes
  if (!ModulesDisabled.SPOTIFY && SpotifyConfig.IsConfigured) server.get('/spotify', CurrentPlaying);
  if (!ModulesDisabled.SPOTIFY && SpotifyConfig.IsConfigured) server.get('/spotify/history', GetSpotifyHistory);

  // Spotify Top
  if (!ModulesDisabled.SPOTIFY && SpotifyConfig.IsConfigured) server.get('/spotify/top/track', GetTopTrack);
  if (!ModulesDisabled.SPOTIFY && SpotifyConfig.IsConfigured) server.get('/spotify/top/artist', GetTopArtist);

  if (!SpotifyConfig.IsConfigured) server.get('/spotify/authorize', AuthorizeSpotify);
  if (!SpotifyConfig.IsConfigured) server.get('/spotify/callback', CallbackSpotify);

  if (next) next();
}

export function AuthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions, next?: () => void): void {
  server.register(Middleware());
  // Stats routes
  if (!ModulesDisabled.STATS) server.post('/stats/track/commands', IncrementCommandCount);
  if (!ModulesDisabled.STATS) server.post('/stats/track/docker', IncrementBuildCount);

  // // Location routes
  // server.post('/location', SetAtLocation);

  // State routes
  if (!ModulesDisabled.STATE) server.post('/state/sleeping', SetSleepingStatus);

  // Uplaoder routes
  if (!ModulesDisabled.FILES) server.post('/upload/image', UploadImageHandler);
  if (!ModulesDisabled.FILES) server.post('/upload/file', UploadFileHandler);

  if (next) next();
}

export function TaskRoutes(server: FastifyInstance, _options: RegisterOptions, next?: () => void): void {
  server.register(Middleware());
  server.post('/tasks/:task_name', RunTask);

  if (next) next();
}
