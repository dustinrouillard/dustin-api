import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { GetLocation, MarkLocation } from 'helpers/location';
import { Locations } from 'modules/interfaces/ILocation';

export async function SetAtLocation(req: FastifyRequest<{ Body: { location: Locations } }>, reply: FastifyReply): Promise<void> {
  try {
    const location = await MarkLocation(req.body.location);

    return Success(reply, 200, location);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function GetLocationData(req: FastifyRequest<{}>, reply: FastifyReply): Promise<void> {
  try {
    const location = await GetLocation();

    return Success(reply, 200, location);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
