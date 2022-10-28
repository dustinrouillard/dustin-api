import { Channel, connect, Connection } from 'amqplib';
import { env } from '../env.js';

export enum RabbitOp {
  SpotifyUpdate
}

export let rabbitClient: Connection;
export let rabbitChannel: Channel;
(async () => {
  rabbitClient = await connect(env.RABBIT_URI);
  rabbitChannel = await rabbitClient.createChannel();
})();
