import { FastifyReply, FastifyRequest } from 'fastify';
import { stringify } from 'querystring';
import { keydb } from '../../connectivity/keydb.js';
import { env } from '../../env.js';

export async function authorizeSpotify(req: FastifyRequest, res: FastifyReply) {
  if (await keydb.exists('spotify/refresh_token')) return res.status(400).send({ code: 'already_authorized', message: 'Spotify is already authorized.' });

  const query = stringify({
    response_type: 'code',
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: encodeURIComponent('user-read-playback-state user-read-currently-playing'),
    redirect_uri: `${env.SPOTIFY_REDIRECT}`
  });

  return res.status(200).send({ url: `https://accounts.spotify.com/authorize?${query}` });
}
