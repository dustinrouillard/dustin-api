/// <reference lib="dom" />

import erlpack from 'erlpack';
import { stringify } from 'querystring';
import { keydb } from '../connectivity/keydb.js';
import { prisma } from '../connectivity/postgres.js';
import { rabbitChannel, RabbitOp } from '../connectivity/rabbit.js';
import { env } from '../env.js';

export async function getOrRegenerateToken() {
  const token = await keydb.get('spotify/access_token');
  if (token) return token;

  const refresh_token = await keydb.get('spotify/refresh_token');
  if (!refresh_token) return;

  const tokensReq = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: stringify({
      refresh_token,
      grant_type: 'refresh_token',
      redirect_uri: env.SPOTIFY_REDIRECT
    })
  });

  if (tokensReq.status != 200) return console.log('Failed to regenerate tokens for spotify account');

  const json = await tokensReq.json();

  if (!json.access_token) return console.log('Failed to regenerate tokens for spotify account');

  await keydb.set('spotify/access_token', json.access_token, { EX: json.expires_in });
  if (json.refresh_token) await keydb.set('spotify/refresh_token', json.refresh_token);
}

(async () => {
  setInterval(async () => {
    const token = await getOrRegenerateToken();
    if (!token) return;

    const playingReq = await fetch('https://api.spotify.com/v1/me/player?additional_types=episode', {
      headers: { authorization: `Bearer ${token}` }
    });

    if (playingReq.status == 204) return await keydb.set('spotify/current', JSON.stringify({ playing: false }));

    const json = await playingReq.json();

    if (!json || (json && (!['track', 'episode'].includes(json.currently_playing_type) || !json.is_playing))) {
      rabbitChannel.sendToQueue('dstn-gateway-ingest', erlpack.pack({ t: RabbitOp.SpotifyUpdate, d: { playing: false } }));
      return await keydb.set('spotify/current', JSON.stringify({ playing: false }));
    }

    const current = {
      playing: true,
      id: json.item.id,
      type: json.item.type,
      name: json.item.name,
      artists: json.item.type == 'episode' ? [{ name: json.item.show?.name }] : json.item.artists.map((artist) => ({ name: artist.name })),
      length: json.item.duration_ms,
      progress: json.progress_ms,
      image: json.item.type == 'episode' ? json.item.show?.images[0]?.url : json.item.album?.images[0]?.url,
      device: { name: json.device.name, type: json.device.type }
    };

    rabbitChannel.sendToQueue('dstn-gateway-ingest', erlpack.pack({ t: RabbitOp.SpotifyUpdate, d: current }));

    await keydb.set('spotify/current', JSON.stringify(current));

    if (json.progress_ms && json.progress_ms < 10000) return;

    const lastEntry = await prisma.spotify_history.findFirst({ where: { id: json.item.id }, orderBy: { listened_at: 'desc' } });

    if (!lastEntry || new Date().getTime() - lastEntry.length >= new Date(lastEntry.listened_at).getTime()) {
      let device = await prisma.spotify_devices.findFirst({ where: { name: json.device.name } });
      if (!device) device = await prisma.spotify_devices.create({ data: { name: json.device.name, type: json.device.type } });

      await prisma.spotify_history.create({
        data: {
          id: json.item.id,
          type: json.item.type,
          name: json.item.name,
          artists: json.item.type == 'episode' ? [{ name: json.item.show?.name }] : json.item.artists.map((artist) => ({ name: artist.name })),
          length: parseInt(json.item.duration_ms, 10),
          image: json.item.type == 'episode' ? json.item.show?.images[0]?.url : json.item.album?.images[0]?.url,
          device: device.id
        }
      });
    }
  }, 1000);
})();
