import { Message } from 'discord.js';
import { MusicPlayer } from '../../MusicPlayer';
import { CommandChain } from '../CommandChain';
import { EmptyCommand } from './EmptyCommand';
import { YouTubeClient } from '../../YouTubeClient';

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

  public async processCommand(command: string, message: Message, musicPlayer: MusicPlayer) {
    if (!command.startsWith('play '))
      return this.nextCommand.processCommand(command, message, musicPlayer);

    if (command.includes('https')) {
      const url = command.split(' ')[1];
      const info = await this.ytClient.getVideoInfoByUrl(url);
      musicPlayer.play({
        url,
        title: info.items[0].snippet.title,
        thumbnail: info.items[0].snippet.thumbnails.default.url,
        duration: info.items[0].contentDetails.duration,
      });
    } else {
      this.ytClient.getVideoInfoByUrl('https://www.youtube.com/watch?v=RvnkAtWcKYg');
      const query = command.split('play ')[1];
      const searchResponse = await this.ytClient.search({ q: query, maxResults: 5 });
      const firstSearch = searchResponse.items[0];

      const videoInfo = await this.ytClient.getVideoInfoById(firstSearch.id.videoId);

      musicPlayer.play({
        url: `https://youtube.com/watch?v=${firstSearch.id.videoId}`,
        title: firstSearch.snippet.title,
        thumbnail: firstSearch.snippet.thumbnails.default.url,
        duration: videoInfo.items[0].contentDetails.duration,
      });
    }
  }
}
