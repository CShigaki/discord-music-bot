import ytDownloader from 'ytdl-core';
import { Message } from 'discord.js';
import {
  AudioPlayerStatus,
	joinVoiceChannel, VoiceConnectionStatus,
} from '@discordjs/voice';
import { getMember } from '../../store/Client';
import { QueueManager } from '../../queue/QueueManager';
import { Queue } from '../../queue/Queue';

export const handlePlay = async (
  msg: Message,
  videoUrl: string
): Promise<void> => {
  const guildId = msg.guildId!;
  const member = getMember(msg.guildId!, msg.author.id);
  const messageContent = msg.content.trim();
  const matches = messageContent.match(/^(~\w+\s)(.*)$/);
  const queueManager = QueueManager.getQueueManager();
  const guildQueue = queueManager.getQueue(guildId) as Queue;

  if (!matches) {
    msg.reply('Invalid command format. Please see `~help` for usage instructions.');

    return;
  }

  if (member?.voice.channel!) {
    let videoTitle;
    try {
      videoTitle = (await ytDownloader.getInfo(videoUrl)).videoDetails.title;
    } catch (err) {
      msg.reply('Video not found.');

      return;
    }

    const audioPlayer = guildQueue.getAudioPlayer();
    const subscription = joinVoiceChannel({
      channelId:  member!.voice.channel.id as string,
      guildId: msg.guildId!,
      adapterCreator:  member.voice.channel!.guild.voiceAdapterCreator,
    }).subscribe(audioPlayer);

    subscription?.connection.on(VoiceConnectionStatus.Ready, () => {
      audioPlayer.on(AudioPlayerStatus.Idle, () => {
        if (!guildQueue.hasNext()) {
          guildQueue.clearQueue();
          subscription.connection.removeAllListeners();
          audioPlayer.removeAllListeners();

          subscription.connection.destroy();

          return;
        }

        guildQueue.skip();
      });
    });

    msg.reply('Added to queue.');
    guildQueue.addToQueue({ url: videoUrl, name: videoTitle });
  }
};