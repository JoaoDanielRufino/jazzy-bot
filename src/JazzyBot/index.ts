import { Client, Message, StageChannel, VoiceChannel, VoiceState } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { MusicPlayer } from '../MusicPlayer';
import { VoiceRecognition } from './VoiceRecognition';
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
  ListenCommand,
  StopListeningCommand,
} from '../Commands/impl';

export interface Subscription {
  musicPlayer: MusicPlayer;
  voiceRecognition: VoiceRecognition;
}

export default class JazzyBot {
  private client: Client;
  private readonly PREFIX = process.env.BOT_PREFIX || 'jazzy';
  private commandChain: CommandChain;
  private subscriptions: Map<string, Subscription>;
  private messageMap: Map<string, Message>;

  constructor(client: Client) {
    this.client = client;
    this.commandChain = this.createCommands();
    this.subscriptions = new Map<string, Subscription>();
    this.messageMap = new Map<string, Message>();

    this.client.on('ready', () => console.log('Bot ready'));
    this.client.on('messageCreate', this.onMessageCreate.bind(this));
    this.client.on('voiceStateUpdate', this.handleVoiceStateUpdate.bind(this));
  }

  private createCommands(): CommandChain {
    const commands: CommandChain[] = [
      new PlayCommand(),
      new PlaySambasCommand(),
      new PlaySambaCommand(),
      new PlayMemesCommand(),
      new PlayMemeCommand(),
      new SkipCommand(),
      new ListenCommand(),
      new StopListeningCommand(),
      new PauseCommand(),
      new ResumeCommand(),
      new ClearQueueCommand(),
      new LeaveCommand(),
      new EmptyCommand(), // EmptyCommand needs to be the last command
    ];

    for (let i = 0; i < commands.length - 1; i++) {
      commands[i].setNext(commands[i + 1]);
    }

    return commands[0];
  }

  private createVoiceConnection(voiceChannel: VoiceChannel | StageChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    connection.on('stateChange', (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.subscriptions.delete(voiceChannel.guildId);
        console.log(`Disconnected from ${voiceChannel.guildId} - ${voiceChannel.guild.name}`);
      }
    });

    return connection;
  }

  private initializeVoiceRecognition(voiceRecognition: VoiceRecognition, guildId: string) {
    voiceRecognition.on('data', (prediction) =>
      this.handlePrediction.bind(this, prediction.toLowerCase(), this.messageMap.get(guildId)!)()
    );

    voiceRecognition.on('error', (err) => console.log(err));
  }

  private handlePrediction(prediction: string, message: Message) {
    console.log({ prediction, guildId: message.guildId });
    if (!prediction.startsWith(this.PREFIX)) return;

    const command = prediction.substr(this.PREFIX.length + 1);
    this.commandChain.processCommand(command, message, this.subscriptions.get(message.guildId!)!);
  }

  private async onMessageCreate(message: Message) {
    if (!message.content.startsWith(this.PREFIX)) return;

    if (!message.member?.voice.channel) {
      await message.reply('You need to be in a voice channel to run a command');
      return;
    }

    const guildId = message.guildId!;
    this.messageMap.set(guildId, message);

    let musicPlayer: MusicPlayer;
    if (this.subscriptions.has(guildId)) {
      musicPlayer = this.subscriptions.get(guildId)!.musicPlayer;
    } else {
      const voiceChannel = message.member!.voice.channel;
      const voiceConnection = this.createVoiceConnection(voiceChannel);

      const voiceRecognition = new VoiceRecognition(voiceConnection);
      this.initializeVoiceRecognition(voiceRecognition, guildId);

      musicPlayer = new MusicPlayer(voiceConnection);

      this.subscriptions.set(guildId, { musicPlayer, voiceRecognition });
    }

    musicPlayer.setMessage(message);

    const command = message.content.substr(this.PREFIX.length + 1);
    this.commandChain.processCommand(command, message, this.subscriptions.get(guildId)!);
  }

  public handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channel && oldState.channel.members.size === 1 && !newState.channel) {
      if (!this.subscriptions.has(oldState.channel.guildId)) return;
      const { musicPlayer } = this.subscriptions.get(oldState.channel.guildId)!;
      musicPlayer.destroy();
    }
  }
}
