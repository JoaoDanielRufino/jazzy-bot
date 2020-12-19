import { Client } from 'discord.js';
import SarveBot from './SarveBot';

const client = new Client();

client.login('Nzg4MTg4MDM2NzQzNTYxMjI2.X9f3Tw.Ilj9TGnRWmNkLnouwiKiaOUNhQU')
  .then(() => {
    new SarveBot(client);
  })
  .catch(err => console.log(err));
