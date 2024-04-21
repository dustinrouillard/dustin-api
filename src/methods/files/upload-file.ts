import { createHash } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Multipart } from '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';

import { env } from '../../env.js';
import { minio } from '../../connectivity/minio.js';

const mimeConversations: { [key: string]: string } = {
  'text/plain': 'txt'
};

interface FileType {
  mime: string;
  extension: string;
}

const AlllowedTypes = ['image/gif', 'image/png', 'image/svg', 'image/webp', 'image/jpeg'];
const AlllowedFileTypes = [
  ...AlllowedTypes,
  'application/octet-stream',
  'application/ogg',
  'application/pdf',
  'application/rtf',
  'application/x-sh',
  'application/x-tar',
  'application/zip',
  'audio/mpeg',
  'audio/ogg',
  'audio/opus',
  'audio/wav',
  'audio/webm',
  'font/otf',
  'font/ttf',
  'font/woff',
  'font/woff2',
  'image/webp',
  'text/css',
  'text/csv',
  'text/javascript',
  'text/plain',
  'video/mov',
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/webm'
];

async function GetType(file: Multipart, buffer: Buffer): Promise<FileType> {
  const preType = file.mimetype;

  let bufferType;
  if (Object.keys(mimeConversations).includes(preType)) {
    bufferType = { mime: preType, ext: mimeConversations[preType] };
  } else bufferType = await fileTypeFromBuffer(buffer);

  return {
    mime: bufferType?.mime || preType,
    extension: bufferType?.ext || mimeConversations[preType]
  };
}

export async function uploadFile(req: FastifyRequest<{ Params: { type: string } }>, res: FastifyReply) {
  const file = await req.file();

  const { type } = req.params;

  if (!['images', 'files'].includes(type)) return res.status(400).send({ code: 'invalid_upload_type', message: 'Invalid upload type' });

  if (!file) return res.status(400).send({ code: 'file_required', message: 'File to upload is required in the multipart formdata' });

  const buffer = await file?.toBuffer();
  const file_type = await GetType(file, buffer);

  if (!file.mimetype || !(type == 'images' ? AlllowedTypes : AlllowedFileTypes).includes(file.mimetype)) throw { code: 'invalid_file_type', data: file.mimetype };

  const hash = createHash('sha1').update(buffer).digest('hex').substring(0, 16);

  const folder = type == 'images' ? 'i' : 'u';
  const file_path = `${hash}${file_type.extension ? `.${file_type.extension}` : ''}`;

  try {
    await minio.send(
      new PutObjectCommand({
        Bucket: env.MINIO_BUCKET,
        Key: `${folder}/${file_path}`,
        Body: buffer,
        ContentType: file_type.mime
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(400).send({ code: 'failed_to_put_object', message: 'Failed to put object to s3 bucket' });
  }

  return res.status(200).send({ success: true, data: { url: type == 'images' ? `${env.IMAGES_DOMAIN}/${file_path}` : `${env.FILES_DOMAIN}/${file_path}` } });
}
