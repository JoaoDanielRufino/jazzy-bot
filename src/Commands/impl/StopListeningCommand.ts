import { Message, MessageEmbed } from 'discord.js';
import { Subscription } from '../../JazzyBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class StopListeningCommand implements CommandChain {
  private nextCommand: CommandChain;
  private commands: Set<string>;

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.commands = new Set<string>(['stop listening']);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!this.commands.has(command))
      return this.nextCommand.processCommand(command, message, subscription);

    console.log('Stopped listening on guild:', message.guildId);
    subscription.voiceRecognition.stopRecogntion();

    const embed = new MessageEmbed().setColor('DARK_ORANGE').setTitle('Stopped listening');

    message.channel.send({ embeds: [embed] });
  }
}
