import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Message } from 'discord.js';

import { initializeStore } from './src/store/Client';
import { handleCommands } from './src/commands';
import { QueueManager } from './src/queue/QueueManager';

dotenv.config();

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildVoiceStates,
]});

initializeStore(client);
QueueManager.createQueueManager();

client.on('ready', () => {
  console.log(`Logged in as ${client?.user!.tag}!`)
});

client.on('messageCreate', async (msg: Message) => {
  if (!msg.guildId) {
    msg.reply('I only work in servers!');

    return;
  }

  handleCommands({
    msg,
  });
});

client.login(process.env.DISCORD_TOKEN);