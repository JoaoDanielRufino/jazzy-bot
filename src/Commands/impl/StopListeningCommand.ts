import { Message, MessageEmbed } from 'discord.js';
import { Subscription } from '../../SarveBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class StopListeningCommand implements CommandChain {
  private nextCommand: CommandChain;

  constructor() {
    this.nextCommand = new EmptyCommand();
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (command !== 'stop listening')
      return this.nextCommand.processCommand(command, message, subscription);

    console.log('Stopped listening on guild:', message.guildId);
    subscription.voiceRecognition.stopRecogntion();

    const embed = new MessageEmbed().setColor('DARK_ORANGE').setTitle('Stopped listening');

    message.channel.send({ embeds: [embed] });
  }
}
