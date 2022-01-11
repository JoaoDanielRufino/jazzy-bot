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
import { parseVideoInfo, randomIndex, shuffle } from './utils';
import { Queue } from './Queue';
import { MusicPlayerEmbeds } from './MusicPlayerEmbeds';
import { YouTubeClient } from '../YouTubeClient';

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
  private ytClient: YouTubeClient;

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
    this.ytClient = new YouTubeClient(process.env.YOUTUBE_API!);

    this.queue.onPushEvent(this.handleQueuePush.bind(this));
    this.audioPlayer.on('stateChange', this.handleStateChange.bind(this));
    this.audioPlayer.on('error', this.handleError.bind(this));
    this.connection.subscribe(this.audioPlayer);
  }

  private handleStateChange(oldState: AudioPlayerState, newState: AudioPlayerState) {
    if (newState.status !== AudioPlayerStatus.Idle) this.lockPushEvent = true;
    else this.lockPushEvent = false;

    if (newState.status === AudioPlayerStatus.Playing) {
      console.log('Playing', newState.resource.metadata);
      this.isPlaying = true;
    } else this.isPlaying = false;

    if (
      oldState.status === AudioPlayerStatus.Playing &&
      newState.status === AudioPlayerStatus.Idle
    ) {
      this.processQueue();
    }
  }

  private handleError(err: AudioPlayerError) {
    console.log(err);
    this.message?.channel.send({ embeds: [this.embedMessages.failedToPlaySongEmbed()] });
    this.processQueue();
  }

  private handleQueuePush(song: SongInfo) {
    if (this.isPlaying && !this.lockEnqueueMessage)
      this.message?.channel.send({
        embeds: [this.embedMessages.enqueueSongEmbed(song, this.queue.size())],
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

    this.message?.channel.send({ embeds: [this.embedMessages.playingInfoEmbed(nextSong)] });
  }

  public play(song: SongInfo) {
    this.queue.push(song);
  }

  public async playPlaylist(urlVideos: string[]) {
    const videoInfosPromises = urlVideos.map((video) => this.ytClient.getVideoInfoByUrl(video));
    const videoInfos = await Promise.all(videoInfosPromises);

    this.message?.channel.send({
      embeds: [this.embedMessages.loadingPlaylist(urlVideos.length)],
    });

    this.lockEnqueueMessage = true;
    videoInfos.forEach((videoInfo) => this.queue.push(parseVideoInfo(videoInfo)));
    this.lockEnqueueMessage = false;
  }

  public async playSamba() {
    const sambaIndex = randomIndex(this.sambas);
    const videoInfo = await this.ytClient.getVideoInfoByUrl(this.sambas[sambaIndex]);
    this.queue.push(parseVideoInfo(videoInfo));
  }

  public async playSambaPlaylist() {
    this.message?.channel.send({
      embeds: [this.embedMessages.loadingSambaPlaylist(this.sambas.length)],
    });

    this.sambas = shuffle(this.sambas);

    const videoInfosPromises = this.sambas.map((samba) => this.ytClient.getVideoInfoByUrl(samba));
    const videoInfos = await Promise.all(videoInfosPromises);

    this.lockEnqueueMessage = true;
    videoInfos.forEach((videoInfo) => this.queue.push(parseVideoInfo(videoInfo)));
    this.lockEnqueueMessage = false;
  }

  public async playMeme() {
    const memeIndex = randomIndex(this.memes);
    const videoInfo = await this.ytClient.getVideoInfoByUrl(this.memes[memeIndex]);
    this.queue.push(parseVideoInfo(videoInfo));
  }

  public async playMemes() {
    this.message?.channel.send({
      embeds: [this.embedMessages.loadingMemePlaylist(this.memes.length)],
    });

    this.memes = shuffle(this.memes);

    const videoInfosPromises = this.memes.map((meme) => this.ytClient.getVideoInfoByUrl(meme));
    const videoInfos = await Promise.all(videoInfosPromises);

    this.lockEnqueueMessage = true;
    videoInfos.forEach((videoInfo) => this.queue.push(parseVideoInfo(videoInfo)));
    this.lockEnqueueMessage = false;
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
