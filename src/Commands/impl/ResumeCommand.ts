import { Message } from 'discord.js';
import { MusicPlayer } from '../../MusicPlayer';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class ResumeCommand implements CommandChain {
  private nextCommand: CommandChain;

  constructor() {
    this.nextCommand = new EmptyCommand();
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, musicPlayer: MusicPlayer) {
    if (command !== 'resume') return this.nextCommand.processCommand(command, message, musicPlayer);

    musicPlayer.resumeSong();
  }
}