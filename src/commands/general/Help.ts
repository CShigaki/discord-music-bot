import { Message } from 'discord.js';

export const handleHelp = (msg: Message) => {
  msg.reply(`
~play <youtube-url> - Plays the audio of a youtube video. You must be in a voice channel to work.
~skip - Skips to the song in the queue.
~queue - Lists the songs in the queue.
~stop - Stops playing the current song and clears the queue.
~clear - Clears the queue.
  `)
};