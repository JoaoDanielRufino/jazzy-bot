import { Message, StreamDispatcher, VoiceConnection } from 'discord.js';
import ytdl from 'ytdl-core';
import memesPlaylist from '../playlists/memes.json';
import sambasPlaylist from '../playlists/sambas.json';

interface SongInfo {
  url: string;
  title: string;
}

type Playlist = Array<SongInfo>;

export default class Player {
  private playing: boolean;
  private memes = memesPlaylist.list;
  private sambas = sambasPlaylist.list;
  private message?: Message;
  private connection?: VoiceConnection;
  private dispatcher?: StreamDispatcher;

  constructor() {
    this.playing = false;
  }

  private shuffle(arr: Playlist): Playlist {
    for(let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private randomIndex(arr: Playlist): number {
    return Math.floor(Math.random() * arr.length);
  }

  private playSingleSong(song: SongInfo) {
    this.dispatcher = this.connection?.play(ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' }));
    this.dispatcher?.on('start', () => {
      this.playing = true;
      this.message?.channel.send(`Now playing: ${song.title}`);
      console.log(`Started playing: ${song.title}`);
    });
    this.dispatcher?.on('finish', () => {
      console.log('Finished playing song');
      this.playing = false;
    });
  }

  private playPlaylist(playlist: Playlist, index: number) {
    if(index >= playlist.length)
        return;

    this.dispatcher = this.connection?.play(ytdl(playlist[index].url, { filter: 'audioonly', quality: 'highestaudio' }));
    this.dispatcher?.on('start', () => {
      this.playing = true;
      this.message?.channel.send(`Now playing: ${playlist[index].title}`);
      console.log(`Started playing: ${playlist[index].title}`);
    });
    this.dispatcher?.on('finish', () => {
      console.log('Finished playing song');
      this.playing = false;
      this.playPlaylist(playlist, index+1);
    });
  }

  public playMeme(connection: VoiceConnection, message: Message) {
    const index = this.randomIndex(this.memes);
    
    this.connection = connection;
    this.message = message;

    this.playSingleSong(this.memes[index]);
  }

  public playMemesPlaylist(connection: VoiceConnection, message: Message) {
    this.memes = this.shuffle(this.memes);

    this.connection = connection;
    this.message = message;

    this.playPlaylist(this.memes, 0);
  }

  public playSambaPlaylist(connection: VoiceConnection, message: Message) {
    this.sambas = this.shuffle(this.sambas);

    this.connection = connection;
    this.message = message;

    this.playPlaylist(this.sambas, 0);
  }

  public skipSong(message: Message) {
    if(!this.playing) {
      message.channel.send('Nothing is playing');
    } else {
      message.channel.send('Skipping song...');
      this.dispatcher?.end();
    }
  }

  public pauseSong(message: Message) {
    if(!this.playing) {
      message.channel.send('Nothing is playing');
    } else {
      message.channel.send('Pausing song...');
      this.dispatcher?.pause();
      this.playing = false;
    }
  }

  public resumeSong(message: Message) {
    if(this.playing) {
      message.channel.send('Song is already playing');
    } else {
      message.channel.send('Resuming song...');
      this.dispatcher?.resume();
      this.playing = true;
    }
  }

  public reset() {
    this.playing = false;
    this.dispatcher?.destroy();
  }
}