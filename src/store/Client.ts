import { Client, GuildMember } from "discord.js";

var client: Client | null = null;

export const initializeStore = (newClient: Client): void => {
  client = newClient;
};

export const getMember = (guildId: string, memberId: string): GuildMember | undefined => {
  const guild = client!.guilds.cache.get(guildId!);

  return guild?.members.cache.get(memberId);
};
