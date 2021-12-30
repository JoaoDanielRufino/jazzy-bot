import { Message } from 'discord.js';
import { Subscription } from '../../SarveBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class SkipCommand implements CommandChain {
  private nextCommand: CommandChain;

  constructor() {
    this.nextCommand = new EmptyCommand();
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (command !== 'skip') return this.nextCommand.processCommand(command, message, subscription);

    subscription.musicPlayer.skipSong();
  }
}
