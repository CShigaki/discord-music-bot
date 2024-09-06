import { AudioPlayer, AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import ytDownloader from '@distube/ytdl-core';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
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
      { filter: 'audio' },
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
      ffmpeg(sourceStream)
        .audioBitrate(128)
        .save(join(process.cwd(), 'media', `${fileName}-${this.guildId}.mp3`))
        .on('progress', p => {
          process.stdout.write(`${p.targetSize}kb downloaded\n`);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject();
        });
    });
  }

  private createResource(stream: any): AudioResource {
    return createAudioResource(stream, { inputType: StreamType.Arbitrary });
  };

  private safeFileName(): string {
    if (!this.currentlyPlaying || !this.currentlyPlaying.name) {
      return '';
    }

    return this.currentlyPlaying.name.replace('|', '');
  }
};
