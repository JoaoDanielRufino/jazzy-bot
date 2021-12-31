import { Message } from 'discord.js';
import { Subscription } from '../JazzyBot';

export interface CommandChain {
  setNext(next: CommandChain): void;
  processCommand(command: string, message: Message, subscription: Subscription): Promise<void>;
}
