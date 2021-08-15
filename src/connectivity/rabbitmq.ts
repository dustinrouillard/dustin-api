import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';
import { Connection, connect, Channel } from 'amqplib';

export let RabbitClient: Connection;
export let RabbitChannel: Channel

export const RabbitConfig = {
  Username: process.env.RABBIT_USERNAME || 'rabbit',
  Password: process.env.RABBIT_PASSWORD || 'docker',
  Host: process.env.RABBIT_HOST || '127.0.0.1',
  Port: Number(process.env.RABBIT_PORT) || 5672,
  Uri: process.env.RABBIT_URI as string,
  Queues: process.env.RABBIT_QUEUES?.split(',') || [process.env.RABBIT_QUEUE]
};

if (!RabbitConfig.Uri) RabbitConfig.Uri = process.env.RABBIT_URI || `amqp://${RabbitConfig.Username && !RabbitConfig.Password ? `${RabbitConfig.Username}@` : `${RabbitConfig.Username}:${RabbitConfig.Password}@`}${RabbitConfig.Host}:${RabbitConfig.Port}`;

(async (): Promise<void> => {
  RabbitClient = await connect(RabbitConfig.Uri);
  RabbitChannel = await RabbitClient.createChannel();

  if (RabbitConfig.Queues.length > 0) for (const queue of RabbitConfig.Queues) RabbitChannel.assertQueue(queue as string);

  Log('RabbitMQ: Connected');
})();