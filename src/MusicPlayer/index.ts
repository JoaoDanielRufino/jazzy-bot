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
import { Message, MessageEmbed } from 'discord.js';

interface SongInfo {
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

  constructor(connection: VoiceConnection) {
    this.audioPlayer = createAudioPlayer();
    this.connection = connection;
    this.sambas = sambasPlaylist.map((samba) => samba.url);
    this.memes = memesPlaylist.map((meme) => meme.url);
    this.queue = new Queue();
    this.lockPushEvent = false;

    this.queue.onPushEvent(this.handleQueuePush.bind(this));
    this.audioPlayer.on('stateChange', this.handleStateChange.bind(this));
    this.audioPlayer.on('error', this.handleError.bind(this));
    this.connection.subscribe(this.audioPlayer);
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

  private handleError(err: AudioPlayerError) {
    console.log('Error message: ', err.message);
    console.log(err);
    this.message?.channel.send('Failed to play song');
    this.processQueue();
  }

  private handleQueuePush() {
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
        })
      )
    );

    const embed = new MessageEmbed()
      .setColor('DARK_ORANGE')
      .setTitle('Now playing')
      .setDescription(`[${nextSong.title}](${nextSong.url})`)
      .setThumbnail(nextSong.thumbnail)
      .setFields({ name: 'Duration', value: nextSong.duration });

    console.log(`Playing ${nextSong.title}`);
    this.message?.channel.send({ embeds: [embed] });
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
      const song = await getSongInfo(samba);
      this.queue.push(song);
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
      const song = await getSongInfo(meme);
      this.queue.push(song);
    });
  }

  public skipSong() {
    this.audioPlayer.stop();
    this.message?.channel.send('Skipping song...');
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
    this.message?.channel.send('Queue is now empty!');
  }

  public destroy() {
    this.audioPlayer.stop();
    this.connection.destroy();
  }

  public setMessage(message: Message) {
    this.message = message;
  }
}
