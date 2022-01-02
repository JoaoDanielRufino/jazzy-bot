import { Message } from 'discord.js';
import { Subscription } from '../../JazzyBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class PlayMemesCommand implements CommandChain {
  private nextCommand: CommandChain;
  private commands: Set<string>;

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.commands = new Set<string>(['memes']);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!this.commands.has(command))
      return this.nextCommand.processCommand(command, message, subscription);

    await subscription.musicPlayer.playMemes();
  }
}
