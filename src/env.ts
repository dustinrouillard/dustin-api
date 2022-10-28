import { str, envsafe, port } from 'envsafe';

export const env = envsafe({
  HOST: str({
    default: '0.0.0.0'
  }),
  PORT: port({
    default: 8080
  }),
  KEYDB_URI: str({
    default: 'redis://10.7.20.3:6379'
  }),
  RABBIT_URI: str({
    default: 'amqp://rabbit:docker@10.7.20.3:5672'
  }),
  SPOTIFY_REDIRECT: str({
    default: 'https://rest.dstn.to/v1/spotify/setup',
    devDefault: 'http://127.0.0.1:8080/v1/spotify/setup'
  }),
  SPOTIFY_CLIENT_ID: str({
    desc: 'Spotify Client ID'
  }),
  SPOTIFY_CLIENT_SECRET: str({
    desc: 'Spotify Client Secret'
  }),
  FILES_DOMAIN: str({
    default: 'https://files.dstn.to'
  }),
  IMAGES_DOMAIN: str({
    default: 'https://dustin.pics'
  }),
  MINIO_ENDPOINT: str({
    default: 'https://dcs.rouillard.cloud'
  }),
  MINIO_BUCKET: str({
    default: 'cdn'
  }),
  MINIO_CLIENT_ID: str({
    desc: 'Minio Client ID'
  }),
  MINIO_CLIENT_SECRET: str({
    desc: 'Minio Client Secret'
  })
});
