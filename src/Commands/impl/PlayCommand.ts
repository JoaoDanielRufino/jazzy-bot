import { Message, MessageEmbed } from 'discord.js';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';
import { YouTubeClient } from '../../YouTubeClient';
import { Subscription } from '../../JazzyBot';
import { MusicPlayer } from '../../MusicPlayer';
import { decode } from 'html-entities';

export class PlayCommand implements CommandChain {
  private nextCommand: CommandChain;
  private ytClient: YouTubeClient;

  constructor() {
    this.nextCommand = new EmptyCommand();
    this.ytClient = new YouTubeClient(process.env.YOUTUBE_API!);
  }

  public setNext(nextCommand: CommandChain) {
    this.nextCommand = nextCommand;
  }

  private async getInfoAndPlayVideo(url: string, musicPlayer: MusicPlayer) {
    const info = await this.ytClient.getVideoInfoByUrl(url);
    musicPlayer.play({
      url,
      title: decode(info.items[0].snippet.title),
      thumbnail: info.items[0].snippet.thumbnails.default.url,
      duration: info.items[0].contentDetails.duration,
    });
  }

  private async searchAndPlayVideo(query: string, musicPlayer: MusicPlayer) {
    const searchResponse = await this.ytClient.search({ q: query, maxResults: 10 });
    const videos = searchResponse.items.filter((item) => item.id.kind.includes('video'));
    const firstSearch = videos[0];

    const videoInfo = await this.ytClient.getVideoInfoById(firstSearch.id.videoId);

    musicPlayer.play({
      url: `https://youtube.com/watch?v=${firstSearch.id.videoId}`,
      title: decode(firstSearch.snippet.title),
      thumbnail: firstSearch.snippet.thumbnails.default.url,
      duration: videoInfo.items[0].contentDetails.duration,
    });
  }

  public async processCommand(command: string, message: Message, subscription: Subscription) {
    if (!command.startsWith('play '))
      return this.nextCommand.processCommand(command, message, subscription);

    if (command.includes('https://open.spotify.com')) {
      const embed = new MessageEmbed()
        .setColor('DARK_ORANGE')
        .setTitle('Spotify is not supported yet');
      await message.channel.send({ embeds: [embed] });
      return;
    }

    const { musicPlayer } = subscription;
    if (command.includes('https://www.youtube.com')) {
      const url = command.split(' ')[1];
      if (url.includes('list=')) {
        const embed = new MessageEmbed()
          .setColor('DARK_ORANGE')
          .setTitle('Playlists are not supported yet');
        await message.channel.send({ embeds: [embed] });
      } else {
        this.getInfoAndPlayVideo(url, musicPlayer);
      }
    } else {
      const query = command.split('play ')[1];
      this.searchAndPlayVideo(query, musicPlayer);
    }
  }
}
