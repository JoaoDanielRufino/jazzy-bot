import { Client, Intents } from 'discord.js';
import * as dotenv from 'dotenv';
import SarveBot from './SarveBot';

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

client
  .login(process.env.BOT_TOKEN)
  .then(() => {
    new SarveBot(client);
  })
  .catch((err) => console.log(err));
