import { MessageEmbed } from 'discord.js';
import { SongInfo } from '..';

export class MusicPlayerEmbeds {
  private readonly COLOR = 'DARK_ORANGE';

  public playingInfoEmbed({ title, url, thumbnail, duration }: SongInfo) {
    return new MessageEmbed()
      .setColor(this.COLOR)
      .setTitle('Now playing')
      .setDescription(`[${title}](${url})`)
      .setThumbnail(thumbnail)
      .setFields({ name: 'Duration', value: duration });
  }

  public failedToPlaySongEmbed() {
    return new MessageEmbed()
      .setColor(this.COLOR)
      .setTitle('Failed to play song')
      .setDescription('Try again');
  }

  public skipSongEmbed() {
    return new MessageEmbed().setColor(this.COLOR).setTitle('Skipping song...');
  }

  public clearQueueEmbed() {
    return new MessageEmbed().setColor(this.COLOR).setTitle('Queue is now empty!');
  }
}
