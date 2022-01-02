import { Message, MessageEmbed } from 'discord.js';
import { Subscription } from '../../JazzyBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class ListenCommand implements CommandChain {
  private nextCommand: CommandChain;
  private commands: Set<string>;

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.commands = new Set<string>(['listen']);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!this.commands.has(command))
      return this.nextCommand.processCommand(command, message, subscription);

    console.log('Started listening voice on guild:', message.guildId);
    subscription.voiceRecognition.startRecogntion();

    const embed = new MessageEmbed()
      .setColor('DARK_ORANGE')
      .setTitle('Started listening to commands')
      .setDescription('You can now say the commands');

    message.channel.send({ embeds: [embed] });
  }
}
