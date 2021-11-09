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
import memesPlaylist from './playlists/memes.json';
import { randomIndex, shuffle } from './utils';
import { Queue } from './Queue';
import { Message } from 'discord.js';

interface SongInfo {
  url: string;
  title: string;
}

export class MusicPlayer {
  private connection?: VoiceConnection;
  private message?: Message;
  private audioPlayer: AudioPlayer;
  private sambas: SongInfo[];
  private memes: SongInfo[];
  private queue: Queue<SongInfo>;
  private lockPushEvent: boolean;

  constructor() {
    this.audioPlayer = createAudioPlayer();
    this.sambas = sambasPlaylist;
    this.memes = memesPlaylist;
    this.queue = new Queue();
    this.lockPushEvent = false;

    this.queue.onPushEvent(this.handleQueuePush.bind(this));
    this.audioPlayer.on('stateChange', this.handleStateChange.bind(this));
  }

  private handleStateChange(oldState: AudioPlayerState, newState: AudioPlayerState) {
    console.log(`oldState: ${oldState.status} - newState: ${newState.status}`);
    if (newState.status !== AudioPlayerStatus.Idle) this.lockPushEvent = true;
    else this.lockPushEvent = false;

    if (
      oldState.status === AudioPlayerStatus.Playing &&
      newState.status === AudioPlayerStatus.Idle
    ) {
      this.processQueue();
    }
  }

  private handleQueuePush() {
    if (!this.lockPushEvent) this.processQueue();
  }

  private processQueue() {
    if (this.queue.empty()) return;

    const nextSong = this.queue.pop()!;

    try {
      this.audioPlayer.play(
        createAudioResource(ytdl(nextSong.url, { filter: 'audioonly', quality: 'highestaudio' }))
      );
      this.message?.channel.send(`Now playing: ${nextSong.title}`);
    } catch (err) {
      console.log(err);
      this.message?.channel.send('Failed to play song');
    }
  }

  public play(song: SongInfo) {
    this.queue.push(song);
  }

  public playSamba() {
    const sambaIndex = randomIndex(this.sambas);
    this.queue.push(this.sambas[sambaIndex]);
  }

  public playSambaPlaylist() {
    this.sambas = shuffle(this.sambas);
    this.sambas.forEach((samba) => this.queue.push(samba));
  }

  public playMeme() {
    const memeIndex = randomIndex(this.memes);
    this.queue.push(this.memes[memeIndex]);
  }

  public playMemes() {
    this.memes = shuffle(this.memes);
    this.memes.forEach((meme) => this.queue.push(meme));
  }

  public skipSong() {
    this.audioPlayer.stop();
    this.message?.channel.send('Skipping song...');
    this.processQueue();
  }

  public setConnection(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this.audioPlayer);
  }

  public setMessage(message: Message) {
    this.message = message;
  }
}
