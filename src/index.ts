import { Client } from 'discord.js';
import * as dotenv from 'dotenv';
import SarveBot from './SarveBot';

const client = new Client();

dotenv.config();

client.login(process.env.BOT_TOKEN)
  .then(() => {
    new SarveBot(client);
  })
  .catch(err => console.log(err));
