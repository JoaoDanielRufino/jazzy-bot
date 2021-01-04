import { Client } from 'discord.js';
import Player from '../Player';

export default class SarveBot {
  private client: Client;
  private player: Player;
  private readonly PREFIX = 'sarve';

  constructor(client: Client) {
    this.client = client;
    this.player = new Player();

    this.client.on('ready', () => {
      console.log('Bot on');
      this.listen();
    });
  }

  private listen() {
    this.client.on('message', async message => {
      let voiceChannel = message.member?.voice.channel;
      switch(message.content) {
        case 'sarve meme':
          if(!voiceChannel)
            return message.channel.send('You need to be in a voice channel to play songs!');
          try {
            const connection = await voiceChannel.join();
            this.player.playMeme(connection, message);
          } catch(err) {
            console.log(err);
            message.channel.send('Failed to play song!');
          }
          break;
        case 'sarve meme playlist':
          if(!voiceChannel)
            return message.channel.send('You need to be in a voice channel to play songs!');
          try {
            const connection = await voiceChannel.join();
            this.player.playMemesPlaylist(connection, message);
          } catch(err) {
            console.log(err);
            message.channel.send('Failed to play song!');
          }
          break;
        case 'sarve samba playlist':
          voiceChannel = message.member?.voice.channel;
          if(!voiceChannel)
            return message.channel.send('You need to be in a voice channel to play songs!');
          try {
            const connection = await voiceChannel.join();
            this.player.playSambaPlaylist(connection, message);
          } catch(err) {
            console.log(err);
            message.channel.send('Failed to play song!');
          }
          break;
        case 'sarve skip':
          this.player.skipSong(message);
          break;
        case 'sarve pause':
          this.player.pauseSong(message);
          break;
        case 'sarve resume':
          this.player.resumeSong(message);
          break;
        case 'sarve leave':
          voiceChannel?.leave();
          this.player.reset();
          break;
        default:
          if(message.content.startsWith(this.PREFIX)) {
            message.channel.send('Invalid command');
          }
      }
    });
  }
}