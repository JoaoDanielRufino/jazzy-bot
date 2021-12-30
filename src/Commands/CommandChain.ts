import { Message } from 'discord.js';
import { Subscription } from '../SarveBot';

export interface CommandChain {
  setNext(next: CommandChain): void;
  processCommand(command: string, message: Message, subscription: Subscription): Promise<void>;
}
