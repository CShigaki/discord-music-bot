import { createAudioPlayer, NoSubscriberBehavior } from "@discordjs/voice";
import { Queue } from "./Queue";

let queueManager: QueueManager;

export class QueueManager {
  private queuesByGuildId: { [ guildId: string ]: Queue } = {};

  static createQueueManager(): void {
    queueManager = new QueueManager();
  };

  static getQueueManager(): QueueManager {
    if (!queueManager) {
      throw new Error('Call .createQueue first.');
    }

    return queueManager;
  };

  createQueue(guildId: string): Queue {
    const audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    const newQueue = new Queue(guildId, audioPlayer);
    this.queuesByGuildId[guildId] = newQueue;

    return newQueue;
  };

  getQueue(guildId: string): Queue | null {
    return this.queuesByGuildId[guildId];
  };
};
