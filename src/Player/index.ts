import { Message, StreamDispatcher, VoiceConnection } from 'discord.js';
import ytdl from 'ytdl-core';
import memesPlaylist from '../playlists/memes.json';

type Playlist = Array<{url: string, title: string}>;

export default class Player {
  private playing: boolean;
  private memes = memesPlaylist.list;
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

  private play(connection: VoiceConnection, playlist: Playlist, index: number) {
    if(index >= playlist.length)
        return;

    this.dispatcher = connection.play(ytdl(playlist[index].url, { filter: 'audioonly' }));
    this.dispatcher.on('start', () => {
      console.log(`Started playing: ${playlist[index].title}`);
      this.playing = true;
    });
    this.dispatcher.on('finish', () => {
      console.log('Finished playing song');
      this.playing = false;
      this.play(connection, playlist, index+1);
    });
  }

  public playMemesPlaylist(connection: VoiceConnection) {
    this.memes = this.shuffle(this.memes);

    this.play(connection, this.memes, 0);
  }

  public skipSong(message: Message) {
    if(!this.playing) {
      message.channel.send('Nothing is playing');
    } else {
      message.channel.send('Skipping song...');
      this.dispatcher?.end();
    }
  }
}