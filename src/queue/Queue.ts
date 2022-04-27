import { AudioPlayer, AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import ytDownloader from 'ytdl-core';
import fs from 'fs';
import { join } from 'path';

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

    const streamToSave = ytDownloader(
      this.currentlyPlaying!.url,
      { filter: 'audioonly' },
    );

    await this.downloadResource(streamToSave);

    const fileName = this.safeFileName();
    const audioResource = this.createResource(join(process.cwd(), 'media', `${fileName}-${this.guildId}.mp3`));

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
    this.nextSongs = [];

    this.audioPlayer.stop();
  };

  skip(): void {
    this.deleteOldSong();
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

  deleteOldSong(): void {
    const fileName = this.safeFileName();
    fs.unlinkSync(join(process.cwd(), 'media', `${fileName}-${this.guildId}.mp3`));
    this.currentlyPlaying = null;
  };

  private downloadResource(sourceStream: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileName = this.safeFileName();
      const writeStream = fs.createWriteStream(join(process.cwd(), 'media', `${fileName}-${this.guildId}.mp3`));

      sourceStream.pipe(writeStream);
      sourceStream.on('finish', () => {
        resolve();
      });

      sourceStream.on('error', (err: any) => {
        console.log('Error');
        console.log(err);
        reject();
      });
    });
  }

  private createResource(stream: any): AudioResource {
    return createAudioResource(stream, { inputType: StreamType.Opus });
  };

  private safeFileName(): string {
    if (!this.currentlyPlaying) {
      return '';
    }

    return this.currentlyPlaying.name.replace('|', '');
  }
};
