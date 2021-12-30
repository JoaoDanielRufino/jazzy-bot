import { VoiceConnection, VoiceReceiver } from '@discordjs/voice';
import googleSpeech, { SpeechClient } from '@google-cloud/speech';

export class VoiceRecognition {
  private receiver: VoiceReceiver;
  // private speechClient: SpeechClient;

  constructor(connection: VoiceConnection) {
    this.receiver = connection.receiver;
    //this.speechClient = new googleSpeech.SpeechClient();

    this.receiver.speaking.on('start', this.startSpeakingHandler.bind(this));
    this.receiver.speaking.on('end', this.endSpeakingHandler.bind(this));
  }

  private startSpeakingHandler(userId: string) {
    console.log('Started speaking', userId);
  }

  private endSpeakingHandler(userId: string) {
    console.log('Ended speaking', userId);
  }
}
