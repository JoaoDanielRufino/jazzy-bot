import { Client, Intents } from 'discord.js';
import * as dotenv from 'dotenv';
import SarveBot from './SarveBot';
// import { createAudioPlayer, joinVoiceChannel, createAudioResource } from '@discordjs/voice';
// import ytdl from 'ytdl-core';

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

// client.on('ready', () => {
//   console.log('Bot ready');
// });
//
// client.on('messageCreate', async (message) => {
//   if (message.content == 'sarve play') {
//     if (!message.member?.voice.channel) {
//       await message.reply('You need to be in a voice channel to play song');
//       return;
//     }
//
//     const voiceChannel = message.member!.voice.channel;
//     const connection = joinVoiceChannel({
//       channelId: voiceChannel.id,
//       guildId: voiceChannel.guild.id,
//       adapterCreator: voiceChannel.guild.voiceAdapterCreator,
//     });
//
//     connection.on('error', (err) => console.log(err));
//
//     const audioPlayer = createAudioPlayer();
//
//     connection.subscribe(audioPlayer);
//
//     audioPlayer.play(
//       createAudioResource(
//         ytdl('https://www.youtube.com/watch?v=rPLLXQDNoFI', {
//           filter: 'audioonly',
//           quality: 'highestaudio',
//         })
//       )
//     );
//
//     audioPlayer.on('error', (err) => console.log(err));
//   }
// });

client
  .login(process.env.BOT_TOKEN)
  .then(() => {
    new SarveBot(client);
  })
  .catch((err) => console.log(err));
