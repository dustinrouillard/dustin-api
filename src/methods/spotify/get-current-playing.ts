import { FastifyReply, FastifyRequest } from 'fastify';
import { keydb } from '../../connectivity/keydb.js';

export async function getCurrentPlaying(req: FastifyRequest, res: FastifyReply) {
  const current = await keydb.get('spotify/current');
  if (!current) return res.status(200).send({ success: true, data: { playing: false } });
  return res.status(200).send({ success: true, data: { playing: true, ...JSON.parse(current) } });
}
