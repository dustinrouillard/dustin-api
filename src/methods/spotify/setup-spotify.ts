/// <reference lib="dom" />

import { FastifyReply, FastifyRequest } from 'fastify';
import { stringify } from 'querystring';
import { keydb } from '../../connectivity/keydb.js';

import { env } from '../../env.js';

export async function setupSpotify(req: FastifyRequest<{ Querystring: { code: string } }>, res: FastifyReply) {
  if (await keydb.exists('spotify/refresh_token')) return res.status(400).send({ code: 'already_authorized', message: 'Spotify is already authorized.' });

  const { code } = req.query;

  const tokensReq = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: stringify({
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.SPOTIFY_REDIRECT
    })
  });

  if (tokensReq.status != 200) return res.status(400).send({ code: 'failed_to_generate', message: 'Failed to generate tokens from Spotify.' });

  const json = await tokensReq.json();

  if (!json.access_token || !json.refresh_token) return res.status(400).send({ code: 'failed_to_generate', message: 'Failed to generate tokens from Spotify.' });

  await keydb.set('spotify/access_token', json.access_token, { EX: json.expires_in });
  await keydb.set('spotify/refresh_token', json.refresh_token);

  return res.status(204).send();
}
