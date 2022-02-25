import { Message } from "discord.js";
import { Queue } from "../../queue/Queue";
import { QueueManager } from "../../queue/QueueManager";

export const handleClear = (msg: Message) => {
  const guildId = msg.guildId as string;
  const queueManager = QueueManager.getQueueManager();
  const guildQueue = queueManager.getQueue(guildId) as Queue;

  if (!guildQueue.hasNext()) {
    msg.reply('Queue is already empty.');

    return;
  }

  guildQueue.clearQueue();
  msg.reply('Cleared queue.');
};
