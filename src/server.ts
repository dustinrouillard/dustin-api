import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';

import { env } from './env.js';
import { routes } from './routes.js';
import './utils/spotify.js';

const server = fastify();

server.register(fastifyMultipart);
server.register(routes, { prefix: '/v1' });

server.get('/health', (req, reply) => {
  reply.status(200).send('OK');
});

server.setNotFoundHandler((req, reply) => {
  reply.status(404).send({ code: 'not_found', message: 'Route not found' });
});

server.listen({ port: env.PORT, host: env.HOST }, () => {
  console.log(`Listening on ${env.HOST}:${env.PORT}`);
});
