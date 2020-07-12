import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';
import { BaseURL } from 'modules/config';

export async function GetRoutes(req: FastifyRequest<{}, {}, {}, {}, { sleeping: boolean }>, reply: FastifyReply<{}>): Promise<void> {
  try {
    return Success(reply, 200, {
      fqdn: req.hostname,
      routes: {
        spotify_data: `${BaseURL}/spotify`,
        spotify_history: `${BaseURL}/spotify/history`,
        state_data: `${BaseURL}/state`,
        stats_data: `${BaseURL}/stats`
      }
    });
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
