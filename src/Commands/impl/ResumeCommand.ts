import { Message } from 'discord.js';
import { Subscription } from '../../JazzyBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class ResumeCommand implements CommandChain {
  private nextCommand: CommandChain;
  private commands: Set<string>;

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.commands = new Set<string>(['resume', 'continue']);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!this.commands.has(command))
      return this.nextCommand.processCommand(command, message, subscription);

    subscription.musicPlayer.resumeSong();
  }
}
