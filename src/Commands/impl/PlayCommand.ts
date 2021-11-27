import { Message } from 'discord.js';
import { getInfo } from 'ytdl-core';
import yts from 'yt-search';
import { MusicPlayer } from '../../MusicPlayer';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class PlayCommand implements CommandChain {
  private nextCommand: CommandChain;

  constructor() {
    this.nextCommand = new EmptyCommand();
  }

  private convertToMinutes(seconds: string) {
    const intSeconds = parseInt(seconds);
    const minutes = Math.floor(intSeconds / 60);
    const remainingSeconds = intSeconds - minutes * 60;

    return `${minutes}:${remainingSeconds}`;
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, musicPlayer: MusicPlayer) {
    if (!command.startsWith('play '))
      return this.nextCommand.processCommand(command, message, musicPlayer);

    if (command.includes('https')) {
      const url = command.split(' ')[1];
      const info = await getInfo(url);
      musicPlayer.play({
        url,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0].url,
        duration: this.convertToMinutes(info.videoDetails.lengthSeconds),
      });
    } else {
      const query = command.split('play ')[1];
      const response = await yts(query);
      const video = response.videos[0];
      musicPlayer.play({
        url: video.url,
        title: video.title,
        thumbnail: video.thumbnail,
        duration: video.duration.timestamp,
      });
    }
  }
}
