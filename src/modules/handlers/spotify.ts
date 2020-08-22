import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { SetupSpotify, GetSpotifyAuthorization, GetCurrentPlaying, PlayingHistory } from 'helpers/spotify';
import { Validate } from '@dustinrouillard/fastify-utilities/modules/validation';

export async function AuthorizeSpotify(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    return Success(reply, 200, GetSpotifyAuthorization());
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function CallbackSpotify(req: FastifyRequest<{ Querystring: { code: string } }>, reply: FastifyReply): Promise<void> {
  try {
    await SetupSpotify(req.query.code);

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function CurrentPlaying(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const playing = await GetCurrentPlaying();

    return Success(reply, 200, playing);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function GetSpotifyHistory(req: FastifyRequest<{ Querystring: { range: 'day' | 'week' | 'month' } }>, reply: FastifyReply): Promise<void> {
  try {
    await Validate(req.query, {
      range: { type: 'string', allowed: ['day', 'week', 'month'], casing: 'any' }
    });
    const history = await PlayingHistory(req.query.range);

    return Success(reply, 200, history);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
