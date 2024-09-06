import ytDownloader from '@distube/ytdl-core';
import { Message } from 'discord.js';
import ytSearcher from '@distube/ytsr';
import {
  AudioPlayerStatus,
	joinVoiceChannel, VoiceConnectionStatus,
} from '@discordjs/voice';
import { getMember } from '../../store/Client';
import { QueueManager } from '../../queue/QueueManager';
import { Queue, Song } from '../../queue/Queue';

const getQueryInfo = async (msg: Message, input: string): Promise<Song | null> => {
  if (input.includes('http')) {
    try {
      const name = (await ytDownloader.getInfo(input)).videoDetails.title;

      return { url: input, name };
    } catch (err) {
      msg.reply('Video not found.');

      return null;
    }
  }

  const { items } = await ytSearcher(input, { safeSearch: true, limit: 1, pages: 1 });
  if (items.length === 0 || items[0].type !== 'video') {
    msg.reply("Somehow I didn't find anything for this query.");

    return null;
  }

  return { url: items[0].url, name: items[0].title };
};

export const handlePlay = async (
  msg: Message,
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

  if (member?.voice.channel) {
    const song = await getQueryInfo(msg, matches[2]);
    if (!song) {
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
          subscription.connection.removeAllListeners();
          audioPlayer.removeAllListeners();

          subscription.connection.destroy();

          guildQueue.deleteOldSong();

          return;
        }

        guildQueue.skip();
      });
    });

    msg.reply('Added to queue.');
    guildQueue.addToQueue(song);
  }
};