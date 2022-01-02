import { Client, Message, StageChannel, VoiceChannel } from 'discord.js';
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
    const listenCommand = new ListenCommand();
    const stopListeningCommand = new StopListeningCommand();
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
    leaveCommand.setNext(listenCommand);
    listenCommand.setNext(stopListeningCommand);
    stopListeningCommand.setNext(emptyCommand);

    return sambaCommand;
  }

  private createVoiceConnection(voiceChannel: VoiceChannel | StageChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    connection.on('stateChange', (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        this.subscriptions.get(voiceChannel.guildId)!.musicPlayer.destroy();
        this.subscriptions.delete(voiceChannel.guildId);
        console.log(`Disconnected from ${voiceChannel.guildId} - ${voiceChannel.guild.name}`);
      } else if (
        newState.status === VoiceConnectionStatus.Destroyed &&
        this.subscriptions.has(voiceChannel.guildId)
      ) {
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
}
