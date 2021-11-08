import {
  AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  VoiceConnection,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import sambasPlaylist from './playlists/sambas.json';
import { randomIndex } from './utils';

export class MusicPlayer {
  private connection?: VoiceConnection;
  private audioPlayer: AudioPlayer;
  private sambas = sambasPlaylist;

  constructor() {
    this.audioPlayer = createAudioPlayer();
  }

  public playSamba() {
    const sambaIndex = randomIndex(this.sambas);
    this.audioPlayer.play(
      createAudioResource(
        ytdl(this.sambas[sambaIndex].url, { filter: 'audioonly', quality: 'highestaudio' })
      )
    );
  }

  public setConnection(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this.audioPlayer);
  }
}
