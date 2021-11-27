import { Message } from 'discord.js';
import { CommandChain } from '../CommandChain';

export class EmptyCommand implements CommandChain {
  public setNext(_: CommandChain) {}

  public async processCommand(_: string, message: Message) {
    await message.channel.send('Command not found');
  }
}
