import {
  AudioPlayer,
  AudioPlayerState,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  VoiceConnection,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import sambasPlaylist from './playlists/sambas.json';
import { randomIndex } from './utils';
import { Queue } from './Queue';

interface SongInfo {
  url: string;
  title: string;
}

export class MusicPlayer {
  private connection?: VoiceConnection;
  private audioPlayer: AudioPlayer;
  private sambas: SongInfo[] = sambasPlaylist;
  private queue: Queue<SongInfo>;
  private isPlaying: boolean;

  constructor() {
    this.audioPlayer = createAudioPlayer();
    this.queue = new Queue();
    this.isPlaying = false;

    this.queue.onPushEvent(this.handleQueuePush.bind(this));
    this.audioPlayer.on('stateChange', this.handleStateChange.bind(this));
  }

  private handleStateChange(oldState: AudioPlayerState, newState: AudioPlayerState) {
    console.log('OLD STATE', oldState.status);
    console.log('NEW STATE', newState.status);
    if (newState.status === AudioPlayerStatus.Playing) this.isPlaying = true;
    else if (newState.status === AudioPlayerStatus.Idle) this.isPlaying = false;

    if (
      oldState.status === AudioPlayerStatus.Playing &&
      newState.status === AudioPlayerStatus.Idle
    ) {
      this.processQueue();
    }
  }

  private handleQueuePush() {
    if (!this.isPlaying) this.processQueue();
  }

  private processQueue() {
    if (this.queue.empty()) return;

    const nextSong = this.queue.pop()!;
    this.audioPlayer.play(
      createAudioResource(ytdl(nextSong.url, { filter: 'audioonly', quality: 'highestaudio' }))
    );
  }

  public playSamba() {
    const sambaIndex = randomIndex(this.sambas);
    this.queue.push(this.sambas[sambaIndex]);
  }

  public setConnection(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this.audioPlayer);
  }
}
