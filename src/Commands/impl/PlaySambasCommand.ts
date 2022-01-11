import { Message } from 'discord.js';
import { Subscription } from '../../JazzyBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';
import sambasPlaylist from '../../MusicPlayer/playlists/sambas.json';
import { shuffle } from '../../utils';

export class PlaySambasCommand implements CommandChain {
  private nextCommand: CommandChain;
  private commands: Set<string>;
  private sambas: string[];

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.commands = new Set<string>(['sambas']);
    this.sambas = sambasPlaylist.map((samba) => samba.url);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!this.commands.has(command))
      return this.nextCommand.processCommand(command, message, subscription);

    this.sambas = shuffle(this.sambas);
    subscription.musicPlayer.playPlaylist(this.sambas);
  }
}
