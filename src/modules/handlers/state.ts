import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { SetSleepingState } from 'helpers/state';

export async function SetSleepingStatus(req: FastifyRequest<{}, {}, {}, {}, { sleeping: boolean }>, reply: FastifyReply<{}>): Promise<void> {
  try {
    await SetSleepingState(req.body.sleeping);

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
