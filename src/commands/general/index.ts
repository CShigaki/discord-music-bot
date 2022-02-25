import { Message } from 'discord.js';
import { QueueManager } from '../../queue/QueueManager';

import { handleHelp } from './Help';
import { handleQueue } from './Queue';

interface GeneralCommandsParameters {
  msg: Message;
}

export const isAGeneralCommand = (msg: Message) => {
  const splitMessage = msg.content.split(' ');
  const command = splitMessage[0];

  switch (command) {
    case '~help':
    case '~queue':
      return true;
    default:
      return false;
  }
}

export const handleGeneralCommands = ({ msg }: GeneralCommandsParameters) => {
  const guildId = msg.guildId as string;
  const splitMessage = msg.content.split(' ');
  const command = splitMessage[0];

  const queueManager = QueueManager.getQueueManager();
  if (!queueManager.getQueue(guildId)) {
    queueManager.createQueue(guildId);
  }

  switch (command) {
    case '~help':
      handleHelp(msg);
      break;
    case '~queue':
      handleQueue(msg);
      break;
  }
};
