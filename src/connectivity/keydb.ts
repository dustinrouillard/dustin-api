import { createClient } from 'redis';
import { env } from '../env.js';

export const keydb = createClient({ url: env.KEYDB_URI });
keydb.connect();
