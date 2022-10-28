import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../connectivity/postgres.js';

export async function getRecentPlays(req: FastifyRequest<{ Querystring: { limit: number } }>, res: FastifyReply) {
  const entries = await prisma.spotify_history.findMany({ orderBy: { listened_at: 'desc' }, take: req.query.limit || 10 });

  return res.status(200).send({ success: true, data: { recents: entries, count: entries.length, limit: req.query.limit } });
}
