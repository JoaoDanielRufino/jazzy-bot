import {
  createAudioPlayer,
  joinVoiceChannel,
  createAudioResource,
} from '@discordjs/voice';
import { Client, Intents } from 'discord.js';
import * as dotenv from 'dotenv';
import ytdl from 'ytdl-core';

dotenv.config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.on('ready', () => {
  console.log('Bot ready');
});

client.on('messageCreate', async (message) => {
  if (message.content == 'sarve play') {
    if (!message.member?.voice.channel) {
      message.reply('You need to be in a voice channel to play song');
      return;
    }

    const voiceChannel = message.member!.voice.channel;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.on('error', (err) => console.log(err));

    const audioPlayer = createAudioPlayer();

    connection.subscribe(audioPlayer);

    audioPlayer.play(
      createAudioResource(
        ytdl('https://www.youtube.com/watch?v=rPLLXQDNoFI', {
          filter: 'audioonly',
          quality: 'highestaudio',
        })
      )
    );

    audioPlayer.on('error', (err) => console.log(err));
  }
});

// function createAudioResource() {
//   return new Promise((resolve, reject) => {
//     const process = ytdl(
//       'https://www.youtube.com/watch?v=rPLLXQDNoFI',
//       {
//         o: '-',
//         q: '',
//         f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
//         r: '100K',
//       },
//       { stdio: ['ignore', 'pipe', 'ignore'] }
//     );
//
//     if (!process.stdout) {
//       reject(new Error('No stdout'));
//
//       return;
//     }
//
//     const stream = process.stdout;
//
//     const onError = (error: Error) => {
//       if (!process.killed) process.kill();
//
//       stream.resume();
//
//       reject(error);
//     };
//
//     process
//
//       .once('spawn', () => {
//         demuxProbe(stream)
//           .then((probe: { stream: any; type: any }) =>
//             resolve(
//               createAudioResource(probe.stream, {
//                 metadata: this,
//                 inputType: probe.type,
//               })
//             )
//           )
//
//           .catch(onError);
//       })
//
//       .catch(onError);
//   });
// }

client.login(process.env.BOT_TOKEN);
