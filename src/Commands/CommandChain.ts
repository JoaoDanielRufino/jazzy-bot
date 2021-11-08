import { Message } from 'discord.js';
import { MusicPlayer } from '../MusicPlayer';

export interface CommandChain {
  setNext(next: CommandChain): void;
  processCommand(command: string, message: Message, musicPlayer: MusicPlayer): void;
}
