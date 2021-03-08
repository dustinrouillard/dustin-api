import { Storage } from '@google-cloud/storage';
import { Stream } from 'stream';

import { GoogleStorage } from 'modules/config';

const gcs = new Storage();

export type UploadType = 'image' | 'file';
export const AlllowedTypes = ['image/gif', 'image/png', 'image/svg', 'image/webp', 'image/jpeg'];
export const AlllowedFileTypes = [...AlllowedTypes, 'application/zip', 'text/plain'];

interface UploadOptions {
  path: string;
  file: Stream;
  public: boolean;
  type: string;
}

export async function UploadFile(options: UploadOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Get target bucket
    const bucket = gcs.bucket(GoogleStorage.Bucket);

    // File definition
    const file = bucket.file(options.path);

    // Meta data and content dispostion if it's not an image or video
    const metadata: { [key: string]: string } = { contentType: options.type };
    if (!(options.type.startsWith('image/') && !options.type.includes('svg')) && !options.type.startsWith('video/')) metadata.contentDisposition = 'attachment';

    // Upload the file to google
    const stream = file.createWriteStream({
      metadata,
      public: options.public
    });

    // Wait for close and return when done.
    stream.on('finish', async () => {
      if (options.public) await file.makePublic();
      resolve(true);
    });

    // If error debug log it and throw
    stream.on('error', (error) => {
      reject(error);
    });

    options.file.pipe(stream);
  });
}
