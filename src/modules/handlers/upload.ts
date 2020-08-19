import { FastifyRequest, FastifyReply } from 'fastify';
import { Validate } from '@dustinrouillard/fastify-utilities/modules/validation';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { Upload } from 'helpers/uploader';

export async function UploadImageHandler(req: FastifyRequest<{ Body: { file: string; name?: string } }>, reply: FastifyReply): Promise<void> {
  try {
    await Validate(
      req.body,
      {
        file: { nullable: false, type: 'string' },
        name: { type: 'string' }
      },
      { required: ['file'], whitelisted: ['file', 'name'] }
    );

    const URL = await Upload(req.body.file, 'image', req.body.name);

    return Success(reply, 200, URL);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function UploadFileHandler(req: FastifyRequest<{ Body: { file: string; name?: string } }>, reply: FastifyReply): Promise<void> {
  try {
    await Validate(
      req.body,
      {
        file: {
          nullable: false,
          type: 'string'
        },
        name: {
          type: 'string'
        }
      },
      { required: ['file'], whitelisted: ['file', 'name'] }
    );

    const URL = await Upload(req.body.file, 'file', req.body.name);

    return Success(reply, 200, URL);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
