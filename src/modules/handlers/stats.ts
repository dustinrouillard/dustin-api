import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { IncrementTotalCommandCount, FetchStatistics, IncrementTotalBuildCount, FetchMonthlyStatistics, FetchDailyStatistics } from 'helpers/stats';
import { GetCurrentPlaying } from 'modules/helpers/spotify';
import { GetSleepingState } from 'modules/helpers/state';

export async function IncrementCommandCount(req: FastifyRequest<{}, {}, {}, {}, {}>, reply: FastifyReply<{}>): Promise<void> {
  try {
    await IncrementTotalCommandCount();

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function IncrementBuildCount(req: FastifyRequest<{}, {}, {}, {}, {}>, reply: FastifyReply<{}>): Promise<void> {
  try {
    await IncrementTotalBuildCount();

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function GetStatistics(req: FastifyRequest<{}, {}, {}, {}, {}>, reply: FastifyReply<{}>): Promise<void> {
  try {
    const monthly = await FetchMonthlyStatistics();
    const daily = await FetchDailyStatistics();
    const weekly = await FetchStatistics();

    const spotify = await GetCurrentPlaying();

    const music_playing = spotify.is_playing;
    delete spotify.is_playing;

    const sleeping = await GetSleepingState();

    return Success(reply, 200, {
      statistics: {
        daily,
        weekly,
        monthly
      },
      state: {
        music_playing,
        sleeping
      },
      spotify
    });
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
