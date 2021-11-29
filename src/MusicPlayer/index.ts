import { Message } from 'discord.js';
import {
  AudioPlayer,
  AudioPlayerError,
  AudioPlayerState,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  VoiceConnection,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import sambasPlaylist from './playlists/sambas.json';
import memesPlaylist from './playlists/memes.json';
import { getSongInfo, randomIndex, shuffle } from './utils';
import { Queue } from './Queue';
import { MusicPlayerEmbeds } from './MusicPlayerEmbeds';

export interface SongInfo {
  url: string;
  title: string;
  thumbnail: string;
  duration: string;
}

export class MusicPlayer {
  private connection: VoiceConnection;
  private message?: Message;
  private audioPlayer: AudioPlayer;
  private sambas: string[];
  private memes: string[];
  private queue: Queue<SongInfo>;
  private lockPushEvent: boolean;
  private lockEnqueueMessage: boolean;
  private isPlaying: boolean;
  private embedMessages: MusicPlayerEmbeds;

  constructor(connection: VoiceConnection) {
    this.audioPlayer = createAudioPlayer();
    this.connection = connection;
    this.sambas = sambasPlaylist.map((samba) => samba.url);
    this.memes = memesPlaylist.map((meme) => meme.url);
    this.queue = new Queue();
    this.lockPushEvent = false;
    this.lockEnqueueMessage = false;
    this.isPlaying = false;
    this.embedMessages = new MusicPlayerEmbeds();

    this.queue.onPushEvent(this.handleQueuePush.bind(this));
    this.audioPlayer.on('stateChange', this.handleStateChange.bind(this));
    this.audioPlayer.on('error', this.handleError.bind(this));
    this.connection.subscribe(this.audioPlayer);
  }

  private handleStateChange(oldState: AudioPlayerState, newState: AudioPlayerState) {
    if (newState.status === AudioPlayerStatus.Buffering)
      console.log('Buffering', newState.resource.metadata);

    if (newState.status !== AudioPlayerStatus.Idle) this.lockPushEvent = true;
    else this.lockPushEvent = false;

    if (newState.status === AudioPlayerStatus.Playing) this.isPlaying = true;
    else this.isPlaying = false;

    if (
      oldState.status === AudioPlayerStatus.Playing &&
      newState.status === AudioPlayerStatus.Idle
    ) {
      this.processQueue();
    }
  }

  private handleError(err: AudioPlayerError) {
    console.log('Error message: ', err.message);
    console.log(err);
    this.message?.channel.send({ embeds: [this.embedMessages.failedToPlaySongEmbed()] });
    this.processQueue();
  }

  private handleQueuePush(song: SongInfo) {
    if (this.isPlaying && !this.lockEnqueueMessage)
      this.message?.channel.send({
        embeds: [this.embedMessages.enqueueSongEmbed(song, this.queue.size().toString())],
      });

    if (!this.lockPushEvent) this.processQueue();
  }

  private processQueue() {
    if (this.queue.empty()) return;

    const nextSong = this.queue.pop()!;

    this.audioPlayer.play(
      createAudioResource(
        ytdl(nextSong.url, {
          filter: 'audioonly',
          quality: 'highestaudio',
          highWaterMark: 1048576 * 32,
        }),
        { metadata: nextSong }
      )
    );

    console.log(`Playing ${nextSong.title}`);
    this.message?.channel.send({ embeds: [this.embedMessages.playingInfoEmbed(nextSong)] });
  }

  public play(song: SongInfo) {
    this.queue.push(song);
  }

  public async playSamba() {
    const sambaIndex = randomIndex(this.sambas);
    const song = await getSongInfo(this.sambas[sambaIndex]);
    this.queue.push(song);
  }

  public playSambaPlaylist() {
    this.sambas = shuffle(this.sambas);
    this.sambas.forEach(async (samba) => {
      this.lockEnqueueMessage = true;
      const song = await getSongInfo(samba);
      this.queue.push(song);
      this.lockEnqueueMessage = false;
    });
  }

  public async playMeme() {
    const memeIndex = randomIndex(this.memes);
    const song = await getSongInfo(this.memes[memeIndex]);
    this.queue.push(song);
  }

  public playMemes() {
    this.memes = shuffle(this.memes);
    this.memes.forEach(async (meme) => {
      this.lockEnqueueMessage = true;
      const song = await getSongInfo(meme);
      this.queue.push(song);
      this.lockEnqueueMessage = false;
    });
  }

  public skipSong() {
    this.audioPlayer.stop();
    this.message?.channel.send({ embeds: [this.embedMessages.skipSongEmbed()] });
    this.processQueue();
  }

  public pauseSong() {
    this.audioPlayer.pause();
  }

  public resumeSong() {
    this.audioPlayer.unpause();
  }

  public clearQueue() {
    this.queue.clear();
    this.message?.channel.send({ embeds: [this.embedMessages.clearQueueEmbed()] });
  }

  public destroy() {
    this.audioPlayer.stop();
    this.connection.destroy();
  }

  public setMessage(message: Message) {
    this.message = message;
  }
}
