import { Message } from 'discord.js';

import { QueueManager } from '../../queue/QueueManager';
import { getMember } from '../../store/Client';
import { handlePlay } from './Play';
import { handleSkip } from './Skip';
import { handleClear } from './Clear';
import { handleStop } from './Stop';

interface ChannelCommandsParameters {
  msg: Message;
}

export const isAChannelCommand = (msg: Message) => {
  const splitMessage = msg.content.split(' ');
  const command = splitMessage[0];

  switch (command) {
    case '~play':
    case '~skip':
    case '~clear':
    case '~stop':
      return true;
    default:
      return false;
  }
};

export const handleChannelCommands = ({
  msg,
}: ChannelCommandsParameters): void => {
  const splitMessage = msg.content.split(' ');
  const command = splitMessage[0];
  const guildId = msg.guildId as string;

  const member = getMember(msg.guildId!, msg.author.id);
  const channel = member!.voice.channel;

  if (!channel) {
    msg.reply('You must be in a voice channel for this command to work!');
  }

  const queueManager = QueueManager.getQueueManager();
  if (!queueManager.getQueue(guildId)) {
    queueManager.createQueue(guildId);
  }

  switch (command) {
    case '~play':
      handlePlay(msg, splitMessage[1]);
      break;
    case '~skip':
      handleSkip(msg);
      break;
    case '~clear':
      handleClear(msg);
      break;
    case '~stop':
      handleStop(msg);
      break;
  }
};
