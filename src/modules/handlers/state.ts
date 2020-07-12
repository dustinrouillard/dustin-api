import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { SetSleepingState, GetSleepingState } from 'helpers/state';
import { GetCurrentPlaying } from 'modules/helpers/spotify';

export async function SetSleepingStatus(req: FastifyRequest<{}, {}, {}, {}, { sleeping: boolean }>, reply: FastifyReply<{}>): Promise<void> {
  try {
    await SetSleepingState(req.body.sleeping);

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function GetCurrentState(req: FastifyRequest<{}, {}, {}, {}, { sleeping: boolean }>, reply: FastifyReply<{}>): Promise<void> {
  try {
    const sleeping = await GetSleepingState();
    const music_playing = (await GetCurrentPlaying()).is_playing;

    return Success(reply, 200, {
      sleeping,
      music_playing
    });
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
