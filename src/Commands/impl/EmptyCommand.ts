import { Message, MessageEmbed } from 'discord.js';
import { CommandChain } from '../CommandChain';

export class EmptyCommand implements CommandChain {
  public setNext(_: CommandChain) {}

  public async processCommand(command: string, message: Message) {
    const embed = new MessageEmbed()
      .setColor('DARK_ORANGE')
      .setTitle('Command not found')
      .setDescription(`[${command}] command not found`);

    message.channel.send({ embeds: [embed] });
  }
}
