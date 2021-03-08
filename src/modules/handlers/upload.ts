import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch, Failed } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { Upload } from 'helpers/uploader';

export async function UploadImageHandler(req: FastifyRequest<{ Body: { file: string; name?: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const file = await req.file();
    if (!file) return Failed(reply, 400, 'missing_file');

    const URL = await Upload(await req.file(), 'image', req.body ? req.body.name : undefined);

    return Success(reply, 200, URL);
  } catch (error) {
    Debug('Error in upload image handler', error);
    return Catch(reply, error);
  }
}

export async function UploadFileHandler(req: FastifyRequest<{ Body: { file: string; name?: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const file = await req.file();
    if (!file) return Failed(reply, 400, 'missing_file');

    const URL = await Upload(await req.file(), 'file', req.body ? req.body.name : undefined);

    return Success(reply, 200, URL);
  } catch (error) {
    Debug('Error in upload file handler', error);
    return Catch(reply, error);
  }
}
