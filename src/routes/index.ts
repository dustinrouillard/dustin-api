import { FastifyInstance, RegisterOptions } from 'fastify';

import { Middleware } from '@dustinrouillard/fastify-security';

import { IncrementCommandCount, IncrementBuildCount, GetStatistics } from '../modules/handlers/stats';

export function UnauthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions<{}, {}, {}>, next?: () => void): void {
  server.get('/stats', GetStatistics);

  if (next) next();
}

export function AuthenticatedRoutes(server: FastifyInstance, _options: RegisterOptions<{}, {}, {}>, next?: () => void): void {
  server.register(Middleware());
  server.post('/stats/track/commands', IncrementCommandCount);
  server.post('/stats/track/docker', IncrementBuildCount);

  if (next) next();
}
