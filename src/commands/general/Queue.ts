import { Message } from "discord.js";
import { Queue } from "../../queue/Queue";
import { QueueManager, Song } from "../../queue/QueueManager";

export const handleQueue = (msg: Message) => {
  const guildId = msg.guildId as string;
  const queueManager = QueueManager.getQueueManager();
  const guildQueue = queueManager.getQueue(guildId) as Queue;

  const currentSong = guildQueue.getCurrentSong();
  const playlist = guildQueue.getPlaylist();

  if (!currentSong && !playlist?.length) {
    msg.reply("There's nothing queued.");

    return;
  }

  let queueMessage = `Now playing: ${currentSong?.name}\n\n`;
  playlist?.forEach((song: Song, index: number) => {
    queueMessage += `${index + 1} - ${song.name}\n`;
  });

  msg.reply(queueMessage);
};
