import { Message } from 'discord.js';
import { Subscription } from '../../JazzyBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';
import { parseVideoInfo, randomIndex } from '../../utils';
import sambasPlaylist from '../../MusicPlayer/playlists/sambas.json';

export class PlaySambaCommand implements CommandChain {
  private nextCommand: CommandChain;
  private commands: Set<string>;
  private sambas: string[];

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.commands = new Set<string>(['samba']);
    this.sambas = sambasPlaylist.map((samba) => samba.url);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!this.commands.has(command))
      return this.nextCommand.processCommand(command, message, subscription);

    const sambaIndex = randomIndex(this.sambas);
    subscription.musicPlayer.play(this.sambas[sambaIndex]);
  }
}
