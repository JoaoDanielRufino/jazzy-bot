import { Client, Message } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { CommandChain } from '../Commands/CommandChain';
import { PlaySambaCommand } from '../Commands/impl/PlaySambaCommand';
import { EmptyCommand } from '../Commands/impl/EmptyCommand';
import { MusicPlayer } from '../MusicPlayer';
import { PlaySambaPlaylistCommand } from '../Commands/impl/PlaySambaPlaylistCommand';
import { SkipCommand } from '../Commands/impl/SkipCommand';
import { PlayMemeCommand } from '../Commands/impl/PlayMemeCommand';
import { PlayMemesCommand } from '../Commands/impl/PlayMemesCommand';
import { PlayCommand } from '../Commands/impl/PlayCommand';

export default class SarveBot {
  private client: Client;
  private readonly PREFIX = 'sarve';
  private commandChain: CommandChain;
  private subscriptions: Map<string, MusicPlayer>;

  constructor(client: Client) {
    this.client = client;
    this.commandChain = this.createCommands();
    this.subscriptions = new Map<string, MusicPlayer>();

    this.client.on('ready', () => console.log('Bot ready'));
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
  }

  private createCommands(): CommandChain {
    const sambaCommand = new PlaySambaCommand();
    const sambaPlaylistCommand = new PlaySambaPlaylistCommand();
    const memeCommand = new PlayMemeCommand();
    const memesPlaylistCommand = new PlayMemesCommand();
    const playCommand = new PlayCommand();
    const skipCommand = new SkipCommand();
    const emptyCommand = new EmptyCommand();

    sambaCommand.setNext(sambaPlaylistCommand);
    sambaPlaylistCommand.setNext(memeCommand);
    memeCommand.setNext(memesPlaylistCommand);
    memesPlaylistCommand.setNext(playCommand);
    playCommand.setNext(skipCommand);
    skipCommand.setNext(emptyCommand);

    return sambaCommand;
  }

  private async onMessageCreate(message: Message) {
    if (!message.content.startsWith(this.PREFIX)) return;

    if (!message.member?.voice.channel) {
      await message.reply('You need to be in a voice channel to run a command');
      return;
    }

    const guildId = message.guildId!;
    let musicPlayer: MusicPlayer;
    if (this.subscriptions.has(guildId)) {
      musicPlayer = this.subscriptions.get(guildId)!;
    } else {
      const voiceChannel = message.member!.voice.channel;
      musicPlayer = new MusicPlayer(
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guildId,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        })
      );
      this.subscriptions.set(guildId, musicPlayer);
    }

    musicPlayer.setMessage(message);

    const command = message.content.substr(this.PREFIX.length + 1);
    this.commandChain.processCommand(command, message, musicPlayer);
  }
}
