import { AudioPlayer } from '@discordjs/voice';
import { Message } from 'discord.js';

import { handleChannelCommands, isAChannelCommand } from './channel';
import { handleGeneralCommands, isAGeneralCommand } from './general';

interface CommandsParameters {
  msg: Message;
};

export const handleCommands = ({
  msg,
}: CommandsParameters): void => {
  if (msg.author.bot) {
    return;
  }

  if (msg.content.charAt(0) !== '~') {
    return
  };

  if (isAChannelCommand(msg)) {
    handleChannelCommands({ msg })
    return;
  }

  if (isAGeneralCommand(msg)) {
    handleGeneralCommands({ msg });
    return;
  }

  msg.reply('Unrecognized command. Type ~help for a list of the available commands.');
};