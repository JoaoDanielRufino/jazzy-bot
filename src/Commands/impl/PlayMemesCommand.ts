import { Message } from 'discord.js';
import { Subscription } from '../../SarveBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class PlayMemesCommand implements CommandChain {
  private nextCommand: CommandChain;

  constructor() {
    this.nextCommand = new EmptyCommand();
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (command !== 'memes') return this.nextCommand.processCommand(command, message, subscription);

    await subscription.musicPlayer.playMemes();
  }
}
