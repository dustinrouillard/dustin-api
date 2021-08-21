import 'module-alias/register';

import { PortConfig } from './modules/config';

import { Log, SetConfig } from '@dustinrouillard/fastify-utilities/modules/logger';
import { Logger, Missing } from '@dustinrouillard/fastify-utilities/modules/request';
SetConfig({ disableTimestamp: true });

import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyMultipart from 'fastify-multipart';

const server = fastify();

import 'tasks';
import { AuthenticatedRoutes, UnauthenticatedRoutes, TaskRoutes } from './routes';

// Register request logger
server.register(Logger({ ignoredRoutes: ['/spotify', '/health'] }));
server.register(fastifyMultipart);

server.register(fastifyCors, {
  origin: (_origin, cb) => {
    cb(null, true);
  }
});

// Routes
server.register(AuthenticatedRoutes);
server.register(UnauthenticatedRoutes);
server.register(TaskRoutes);
server.register(Missing);

server.listen(PortConfig, '0.0.0.0', () => Log(`API: Listening on ${PortConfig}`));