import { AudioPlayer, AudioResource, createAudioResource } from "@discordjs/voice";
import ytDownloader from 'ytdl-core';

export interface Song {
  url: string;
  name: string;
}

export type Playlist = Array<Song>;

export class Queue {
  private audioPlayer: AudioPlayer;
  private guildId: string;
  private currentlyPlaying: Song | null = null;
  private nextSongs: Playlist = [];

  constructor(guildId: string, audioPlayer: AudioPlayer) {
    this.audioPlayer = audioPlayer;
    this.guildId = guildId;
    this.currentlyPlaying = null;
    this.nextSongs = [];
  }

  async play(): Promise<void> {
    if (!this.currentlyPlaying) {
      throw new Error('Nothing to play.');
    }

    const audioResource = this.createResource(
      ytDownloader(
        this.currentlyPlaying!.url,
        { filter: 'audioonly' },
      ),
    );

    this.audioPlayer.play(audioResource);
  };

  addToQueue(song: Song): void {
    if (!this.currentlyPlaying) {
      this.currentlyPlaying = song;

      this.play();

      return;
    }

    if (this.currentlyPlaying) {
      this.nextSongs.push(song);
    };
  };

  stop(): void {
    this.currentlyPlaying = null;
    this.nextSongs = [];

    this.audioPlayer.stop();
  };

  skip(): void {
    const nextSong = this.nextSongs.shift() as Song;
    this.currentlyPlaying = nextSong;

    this.play();
  };

  hasNext(): boolean {
    return this.nextSongs.length > 0;
  };

  clearQueue(): void {
    this.nextSongs = [];
  };

  getCurrentSong(): Song | null {
    return this.currentlyPlaying;
  };

  getPlaylist(): Playlist | null {
    return this.nextSongs;
  };

  getAudioPlayer(): AudioPlayer {
    return this.audioPlayer;
  };

  private createResource(stream: any): AudioResource {
    return createAudioResource(stream);
  };
};
