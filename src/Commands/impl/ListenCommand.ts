import { Message, MessageEmbed } from 'discord.js';
import { Subscription } from '../../SarveBot';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';

export class ListenCommand implements CommandChain {
  private nextCommand: CommandChain;

  constructor() {
    this.nextCommand = new EmptyCommand();
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (command !== 'listen')
      return this.nextCommand.processCommand(command, message, subscription);

    console.log('Started listening voice on guild:', message.guildId);
    subscription.voiceRecognition.startRecognition();

    const embed = new MessageEmbed()
      .setColor('DARK_ORANGE')
      .setTitle('Started listening to commands')
      .setDescription('You can now say the commands');

    message.channel.send({ embeds: [embed] });
  }
}
