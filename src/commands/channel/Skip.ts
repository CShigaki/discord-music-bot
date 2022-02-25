import { Message } from "discord.js";
import { Queue } from "../../queue/Queue";
import { QueueManager } from "../../queue/QueueManager";

export const handleSkip = (msg: Message) => {
  const guildId = msg.guildId as string;
  const queueManager = QueueManager.getQueueManager();
  const guildQueue = queueManager.getQueue(guildId) as Queue;

  if (guildQueue.hasNext()) {
    msg.reply('Skipping...');
    guildQueue.skip();

    return;
  }

  msg.reply('There\'s nothing to skip to.');
};
