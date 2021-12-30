import { Client, Message, StageChannel, VoiceChannel } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { MusicPlayer } from '../MusicPlayer';
import { CommandChain } from '../Commands/CommandChain';
import {
  PlaySambaCommand,
  PlaySambasCommand,
  PlayMemeCommand,
  PlayMemesCommand,
  PlayCommand,
  SkipCommand,
  LeaveCommand,
  EmptyCommand,
  ResumeCommand,
  PauseCommand,
  ClearQueueCommand,
} from '../Commands/impl';

export default class SarveBot {
  private client: Client;
  private readonly PREFIX = process.env.BOT_PREFIX || 'sarve';
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
    const sambaPlaylistCommand = new PlaySambasCommand();
    const memeCommand = new PlayMemeCommand();
    const memesPlaylistCommand = new PlayMemesCommand();
    const playCommand = new PlayCommand();
    const skipCommand = new SkipCommand();
    const leaveCommand = new LeaveCommand();
    const pauseCommand = new PauseCommand();
    const resumeCommand = new ResumeCommand();
    const clearQueueCommand = new ClearQueueCommand();
    const emptyCommand = new EmptyCommand();

    sambaCommand.setNext(sambaPlaylistCommand);
    sambaPlaylistCommand.setNext(memeCommand);
    memeCommand.setNext(memesPlaylistCommand);
    memesPlaylistCommand.setNext(playCommand);
    playCommand.setNext(skipCommand);
    skipCommand.setNext(pauseCommand);
    pauseCommand.setNext(resumeCommand);
    resumeCommand.setNext(clearQueueCommand);
    clearQueueCommand.setNext(leaveCommand);
    leaveCommand.setNext(emptyCommand);

    return sambaCommand;
  }

  private createVoiceConnection(voiceChannel: VoiceChannel | StageChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.on('stateChange', (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        this.subscriptions.get(voiceChannel.guildId)!.destroy();
        this.subscriptions.delete(voiceChannel.guildId);
        console.log(`Disconnected from ${voiceChannel.guildId} - ${voiceChannel.guild.name}`);
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.subscriptions.delete(voiceChannel.guildId);
        console.log(`Disconnected from ${voiceChannel.guildId} - ${voiceChannel.guild.name}`);
      }
    });

    return connection;
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
      const voiceConnection = this.createVoiceConnection(voiceChannel);

      musicPlayer = new MusicPlayer(voiceConnection);

      this.subscriptions.set(guildId, musicPlayer);
    }

    musicPlayer.setMessage(message);

    const command = message.content.substr(this.PREFIX.length + 1);
    this.commandChain.processCommand(command, message, musicPlayer);
  }
}
