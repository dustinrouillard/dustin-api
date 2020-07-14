import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

export async function HealthCheck(req: FastifyRequest<{}, {}, {}, {}, { sleeping: boolean }>, reply: FastifyReply<{}>): Promise<void> {
  try {
    return Success(reply, 200);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
