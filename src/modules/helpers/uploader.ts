import { fromBuffer as typeFromBuffer } from 'file-type';
import { createHash } from 'crypto';

import { AlllowedFileTypes, AlllowedTypes, UploadFile, UploadType } from 'utils/minio';
import { MinioStorage } from 'modules/config';

import { Multipart } from 'fastify-multipart';

export async function Upload(file: Multipart, type: UploadType, name?: string): Promise<string> {
  // Get buffer and file type
  const buffer = await file.toBuffer();
  const file_type = await typeFromBuffer(buffer);

  // Ignore mimetypes that are not allowed
  if (!file_type?.mime || !(type == 'file' ? AlllowedFileTypes : AlllowedTypes.includes(file_type?.mime))) throw { code: 'invalid_file_type' };

  // Create the sha1 hash for the file name
  const hash = createHash('sha1').update(buffer).digest('hex').substring(0, 16);

  // Folder and file path
  const folder = type == 'image' ? MinioStorage.ImagesFolder : MinioStorage.UploadsFolder;
  const file_path = `${name || hash}.${file_type.ext}`;

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
