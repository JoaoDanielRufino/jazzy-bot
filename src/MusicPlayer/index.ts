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
import { parseVideoInfo } from '../utils';
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
  private queue: Queue<SongInfo>;
  private lockPushEvent: boolean;
  private lockEnqueueMessage: boolean;
  private embedMessages: MusicPlayerEmbeds;
  private ytClient: YouTubeClient;

  constructor(connection: VoiceConnection) {
    this.audioPlayer = createAudioPlayer();
    this.connection = connection;
    this.queue = new Queue();
    this.lockPushEvent = false;
    this.lockEnqueueMessage = false;
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

    if (newState.status === AudioPlayerStatus.Playing)
      console.log('Playing', newState.resource.metadata);

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
    if (this.audioPlayer.state.status === AudioPlayerStatus.Playing && !this.lockEnqueueMessage)
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

  public async play(url: string) {
    const songInfo = await this.ytClient.getVideoInfoByUrl(url);
    this.queue.push(parseVideoInfo(songInfo));
  }

  public async playPlaylist(urlVideos: string[]) {
    this.message?.channel.send({
      embeds: [this.embedMessages.loadingPlaylist(urlVideos.length)],
    });

    const videoInfosPromises = urlVideos.map((video) => this.ytClient.getVideoInfoByUrl(video));
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
