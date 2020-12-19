import { VoiceConnection } from 'discord.js';
import ytdl from 'ytdl-core';
import memesPlaylist from '../playlists/memes.json';

export default class Player {
  private playing: boolean;
  private memes = memesPlaylist.list;

  constructor() {
    this.playing = false;
  }

  public playMemesPlaylist(connection: VoiceConnection) {
    const dispatcher = connection.play(ytdl(this.memes[0].url));
    dispatcher.on('start', () => {
      console.log('Started playing');
      this.playing = true;
    });
    dispatcher.on('finish', () => {
      console.log('Finished playing song');
      this.playing = false;
    });
  }
}