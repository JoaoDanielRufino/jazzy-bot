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

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, musicPlayer: MusicPlayer) {
    if (!command.startsWith('play '))
      return this.nextCommand.processCommand(command, message, musicPlayer);

    if (command.includes('https')) {
      const url = command.split(' ')[1];
      const info = await getInfo(url);
      musicPlayer.play({ url, title: info.videoDetails.title });
    } else {
      const query = command.split('play ')[1];
      const response = await yts(query);
      const video = response.videos[0];
      musicPlayer.play({ url: video.url, title: video.title });
    }
  }
}
