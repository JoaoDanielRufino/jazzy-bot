import { EndBehaviorType, VoiceConnection, VoiceReceiver } from '@discordjs/voice';
import googleSpeech, { SpeechClient } from '@google-cloud/speech';
import { pipeline } from 'node:stream';
import prism from 'prism-media';
import { TypedEmitter } from 'tiny-typed-emitter';

interface VoiceRecognitionEvents {
  data: (prediction: string) => void;
  error: (err: any) => void;
}

export class VoiceRecognition extends TypedEmitter<VoiceRecognitionEvents> {
  private receiver: VoiceReceiver;
  private speechClient: SpeechClient;

  constructor(connection: VoiceConnection) {
    super();
    this.receiver = connection.receiver;
    this.speechClient = new googleSpeech.SpeechClient({
      credentials: {
        client_email: process.env.GCLOUD_EMAIL!,
        private_key: process.env.GCLOUD_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      },
    });
  }

  private startSpeakingHandler(userId: string) {
    const streamRecognizer = this.speechClient.streamingRecognize({
      config: { encoding: 'LINEAR16', sampleRateHertz: 48000, languageCode: 'en-US' },
    });

    streamRecognizer.on('error', (err) => this.emit('error', err));
    streamRecognizer.on('data', this.handleDataRecognizer.bind(this));

    const opusStream = this.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 100,
      },
    });

    const prismDecoder = new prism.opus.Decoder({ channels: 1, rate: 48000, frameSize: 960 });

    pipeline(opusStream, prismDecoder, streamRecognizer, (err) => {
      if (err) this.emit('error', err);
    });
  }

  private handleDataRecognizer(response: any) {
    this.emit('data', response.results[0].alternatives[0].transcript);
  }

  public startRecogntion() {
    this.receiver.speaking.on('start', this.startSpeakingHandler.bind(this));
  }

  public stopRecogntion() {
    this.receiver.speaking.removeAllListeners();
  }
}
