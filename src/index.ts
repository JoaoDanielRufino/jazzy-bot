import { Client, Intents } from 'discord.js';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import * as dotenv from 'dotenv';
import SarveBot from './SarveBot';

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

const ssmClient = new SSMClient({ region: 'us-east-1' });

async function getSSMToken() {
  const data = await ssmClient.send(
    new GetParameterCommand({
      Name: 'sarve-bot-parameter-store-token',
      WithDecryption: true,
    })
  );

  return data.Parameter?.Value;
}

async function getYoutubeApiToken() {
  const data = await ssmClient.send(
    new GetParameterCommand({
      Name: 'youtube-api-parameter-store',
      WithDecryption: true,
    })
  );

  return data.Parameter?.Value;
}

async function main() {
  try {
    const discordToken = process.env.BOT_TOKEN || (await getSSMToken());

    if (!process.env.YOUTUBE_API) {
      const youtubeApiKey = await getYoutubeApiToken();
      process.env.YOUTUBE_API = youtubeApiKey;
    }

    new SarveBot(client);
    await client.login(discordToken);
  } catch (err) {
    console.log(err);
  }
}

main();
