import { EndBehaviorType, VoiceConnection, VoiceReceiver } from '@discordjs/voice';
import googleSpeech, { SpeechClient } from '@google-cloud/speech';
import { pipeline } from 'node:stream';
import prism from 'prism-media';

export class VoiceRecognition {
  private receiver: VoiceReceiver;
  private speechClient: SpeechClient;

  constructor(connection: VoiceConnection) {
    this.receiver = connection.receiver;
    this.speechClient = new googleSpeech.SpeechClient({
      credentials: {
        client_email: process.env.GCLOUD_EMAIL!,
        private_key: process.env.GCLOUD_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      },
    });
  }

  private startSpeakingHandler(userId: string) {
    console.log('Started speaking', userId);

    const streamRecognizer = this.speechClient.streamingRecognize({
      config: { encoding: 'LINEAR16', sampleRateHertz: 48000, languageCode: 'pt-BR' },
    });

    streamRecognizer.on('error', this.handleErrorRecognizer.bind(this));
    streamRecognizer.on('data', this.handleDataRecognizer.bind(this));

    const opusStream = this.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 100,
      },
    });

    const prismDecoder = new prism.opus.Decoder({ channels: 1, rate: 48000, frameSize: 960 });

    pipeline(opusStream, prismDecoder, streamRecognizer, (err) => {
      if (err) console.log(err);
    });
  }

  private endSpeakingHandler(userId: string) {
    console.log('Ended speaking', userId);
  }

  private handleDataRecognizer(response: any) {
    console.log(response.results[0].alternatives);
  }

  private handleErrorRecognizer(err: Error) {
    console.log(err);
  }

  public startRecognition() {
    this.receiver.speaking.on('start', this.startSpeakingHandler.bind(this));
    this.receiver.speaking.on('end', this.endSpeakingHandler.bind(this));
  }

  public stopRecognition() {
    this.receiver.speaking.removeAllListeners();
  }
}
