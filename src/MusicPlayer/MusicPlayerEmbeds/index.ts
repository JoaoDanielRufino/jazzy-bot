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

  public enqueueSongEmbed({ title, url, thumbnail, duration }: SongInfo, position: number) {
    return new MessageEmbed()
      .setColor(this.COLOR)
      .setTitle('Song successfully enqueued')
      .setDescription(`[${title}](${url})`)
      .setThumbnail(thumbnail)
      .setFields(
        { name: 'Duration', value: duration, inline: true },
        { name: 'Position on queue', value: position.toString(), inline: true }
      );
  }

  public skipSongEmbed() {
    return new MessageEmbed().setColor(this.COLOR).setTitle('Skipping song...');
  }

  public clearQueueEmbed() {
    return new MessageEmbed().setColor(this.COLOR).setTitle('Queue is now empty!');
  }

  public loadingPlaylist(numberOfSongs: number) {
    return new MessageEmbed()
      .setColor(this.COLOR)
      .setTitle('Loading playlist...')
      .setFields({ name: 'Number of songs', value: numberOfSongs.toString() });
  }

  public loadingSambaPlaylist(numberOfSongs: number) {
    return new MessageEmbed()
      .setColor(this.COLOR)
      .setTitle('Loading samba playlist...')
      .setFields({ name: 'Number of songs', value: numberOfSongs.toString() });
  }

  public loadingMemePlaylist(numberOfSongs: number) {
    return new MessageEmbed()
      .setColor(this.COLOR)
      .setTitle('Loading meme playlist...')
      .setFields({ name: 'Number of songs', value: numberOfSongs.toString() });
  }
}
