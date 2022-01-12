import { Message } from 'discord.js';
import { Subscription } from '../../JazzyBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';
import memesPlaylist from '../../MusicPlayer/playlists/memes.json';
import { randomIndex } from '../../utils';

export class PlayMemeCommand implements CommandChain {
  private nextCommand: CommandChain;
  private commands: Set<string>;
  private memes: string[];

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.commands = new Set<string>(['meme']);
    this.memes = memesPlaylist.map((meme) => meme.url);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!this.commands.has(command))
      return this.nextCommand.processCommand(command, message, subscription);

    const memeIndex = randomIndex(this.memes);
    subscription.musicPlayer.play(this.memes[memeIndex]);
  }
}
