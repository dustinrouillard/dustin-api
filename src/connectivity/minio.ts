import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../env.js';

export const minio = new S3Client({
  endpoint: env.MINIO_ENDPOINT,
  forcePathStyle: true,
  region: 'none',
  credentials: {
    accessKeyId: env.MINIO_CLIENT_ID,
    secretAccessKey: env.MINIO_CLIENT_SECRET
  }
});
