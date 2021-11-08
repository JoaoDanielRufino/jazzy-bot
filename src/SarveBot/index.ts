import { Client, Message, StageChannel, VoiceChannel } from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import { CommandChain } from '../Commands/CommandChain';
import { PlaySambaCommand } from '../Commands/impl/PlaySambaCommand';
import { EmptyCommand } from '../Commands/impl/EmptyCommand';
import { MusicPlayer } from '../MusicPlayer';
import { PlaySambaPlaylistCommand } from '../Commands/impl/PlaySambaPlaylistCommand';
import { SkipCommand } from '../Commands/impl/SkipCommand';

export default class SarveBot {
  private client: Client;
  private readonly PREFIX = 'sarve';
  private commandChain: CommandChain;
  private voiceChannel?: VoiceChannel | StageChannel;
  private connection?: VoiceConnection;
  private musicPlayer: MusicPlayer;

  constructor(client: Client) {
    this.client = client;
    this.commandChain = this.createCommands();
    this.musicPlayer = new MusicPlayer();

    this.client.on('ready', () => console.log('Bot ready'));
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
  }

  private createCommands(): CommandChain {
    const sambaCommand = new PlaySambaCommand();
    const sambaPlaylistCommand = new PlaySambaPlaylistCommand();
    const skipCommand = new SkipCommand();
    const emptyCommand = new EmptyCommand();

    sambaCommand.setNext(sambaPlaylistCommand);
    sambaPlaylistCommand.setNext(skipCommand);
    skipCommand.setNext(emptyCommand);

    return sambaCommand;
  }

  private joinVoiceChannel() {
    this.connection = joinVoiceChannel({
      channelId: this.voiceChannel!.id,
      guildId: this.voiceChannel!.guildId,
      adapterCreator: this.voiceChannel!.guild.voiceAdapterCreator,
    });
  }

  private handleConnection(message: Message) {
    if (!this.voiceChannel || this.voiceChannel != message.member!.voice.channel) {
      this.voiceChannel = message.member!.voice.channel!;
    }

    if (!this.connection) {
      this.joinVoiceChannel();
    }

    this.musicPlayer.setConnection(this.connection!);
  }

  private async onMessageCreate(message: Message) {
    if (!message.content.startsWith(this.PREFIX)) return;

    if (!message.member?.voice.channel) {
      await message.reply('You need to be in a voice channel to run a command');
      return;
    }

    this.handleConnection(message);
    this.musicPlayer.setMessage(message);

    const command = message.content.substr(this.PREFIX.length + 1);
    this.commandChain.processCommand(command, message, this.musicPlayer);
  }
}
