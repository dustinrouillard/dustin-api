import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { ExecuteTask } from 'helpers/tasks';

export async function RunTask(req: FastifyRequest<{}, {}, { task_name: string }, {}, {}>, reply: FastifyReply<{}>): Promise<void> {
  try {
    await ExecuteTask(req.params.task_name);

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
