import { Message } from 'discord.js';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';
import { MusicPlayer } from '../../MusicPlayer';

export class PlaySambaPlaylistCommand implements CommandChain {
  private nextCommand: CommandChain;

  constructor() {
    this.nextCommand = new EmptyCommand();
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, musicPlayer: MusicPlayer) {
    if (command !== 'sambas') return this.nextCommand.processCommand(command, message, musicPlayer);

    musicPlayer.playSambaPlaylist();
  }
}
