import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { keydb } from '../connectivity/keydb.js';

export const permitted = fp(async (server: FastifyInstance) => {
  server.addHook('preHandler', async (req, res) => {
    const token = req.headers.authorization;
    if (!token)
      return res.status(403).send({
        code: 'missing_authentication',
        message: 'Missing authentication.'
      });

    const valid = await keydb.exists(`permitted_tokens:${token}`);
    if (!valid)
      return res.status(403).send({
        code: 'invalid_authentication',
        message: 'Provided authentication is invalid.'
      });
  });
});
