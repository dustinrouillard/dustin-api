import { fromBuffer as typeFromBuffer } from 'file-type';
import { createHash } from 'crypto';

import { AlllowedFileTypes, AlllowedTypes, UploadFile, UploadType } from 'utils/minio';
import { MinioStorage } from 'modules/config';

import { Multipart } from 'fastify-multipart';

const mimeConversations: { [key: string]: string } = {
  'text/plain': '.txt'
};

interface FileType {
  mime: string;
  extension: string;
}

async function GetType(file: Multipart, buffer: Buffer): Promise<FileType> {
  const preType = file.mimetype;

  let bufferType;
  if (Object.keys(mimeConversations).includes(preType)) {
    bufferType = { mime: preType, ext: mimeConversations[preType] };
  } else bufferType = await typeFromBuffer(buffer);

  return {
    mime: bufferType?.mime || preType,
    extension: bufferType?.ext || mimeConversations[preType]
  };
}

export async function Upload(file: Multipart, type: UploadType, name?: string): Promise<string> {
  // Get buffer and file type
  const buffer = await file.toBuffer();
  const file_type = await GetType(file, buffer);

  // Ignore mimetypes that are not allowed
  if ((!file.mimetype || !AlllowedTypes.includes(file.mimetype)) && type == 'image') throw { code: 'invalid_file_type', data: file.mimetype };

  // Create the sha1 hash for the file name
  const hash = createHash('sha1').update(buffer).digest('hex').substring(0, 16);

  // Folder and file path
  const folder = type == 'image' ? MinioStorage.ImagesFolder : MinioStorage.UploadsFolder;
  const file_path = `${name || hash}.${file_type.extension}`;

  // Upload file using the upload utility
  await UploadFile({
    file: buffer,
    path: `${folder}/${file_path}`,
    public: true,
    type: file_type.mime
  });

  // Custom domain responses
  let url = `${MinioStorage.Host}/${folder}/${file_path}`;
  if (type == 'image' && MinioStorage.ImagesDomain) url = `${MinioStorage.ImagesDomain}/${file_path}`;
  if (type == 'file' && MinioStorage.UploadsDomain) url = `${MinioStorage.UploadsDomain}/${file_path}`;

  return url;
}
