import { Message } from "discord.js";
import { Queue } from "../../queue/Queue";
import { QueueManager } from "../../queue/QueueManager";

export const handleStop = (msg: Message) => {
  const guildId = msg.guildId as string;
  const queueManager = QueueManager.getQueueManager();
  const guildQueue = queueManager.getQueue(guildId) as Queue;

  guildQueue.stop();

  msg.reply('Stopping...');
};
