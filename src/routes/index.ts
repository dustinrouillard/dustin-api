import { FastifyInstance, RegisterOptions } from 'fastify';

import { Middleware } from '@dustinrouillard/fastify-security';

import { IncrementCommandCount, IncrementBuildCount, GetStatistics } from '../modules/handlers/stats';

export function Route(server: FastifyInstance, _options: RegisterOptions<{}, {}, {}>, next?: () => void): void {
  server.register(Middleware(), { prefix: '/stats/track' });
  server.post('/stats/track/commands', IncrementCommandCount);
  server.post('/stats/track/docker', IncrementBuildCount);

  server.get('/stats', GetStatistics);

  if (next) next();
}
