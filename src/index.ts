import { Client, Intents } from 'discord.js';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import * as dotenv from 'dotenv';
import SarveBot from './SarveBot';

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

const ssmClient = new SSMClient({ region: 'us-east-1' });

async function getParameters() {
  const data = await Promise.all([
    ssmClient.send(
      new GetParameterCommand({
        Name: 'sarve-bot-parameter-store-token',
        WithDecryption: true,
      })
    ),
    ssmClient.send(
      new GetParameterCommand({
        Name: 'youtube-api-parameter-store',
        WithDecryption: true,
      })
    ),
    ssmClient.send(
      new GetParameterCommand({
        Name: 'gcloud-sarve-bot-email',
        WithDecryption: true,
      })
    ),
    ssmClient.send(
      new GetParameterCommand({
        Name: 'gcloud-sarve-bot-private-key',
        WithDecryption: true,
      })
    ),
  ]);

  const parameters: { [key: string]: string } = {};
  data.forEach((parameter) => {
    const name = parameter.Parameter?.Name as string;
    parameters[name] = parameter.Parameter?.Value as string;
  });

  return parameters;
}

async function main() {
  try {
    if (
      !process.env.BOT_TOKEN ||
      !process.env.YOUTUBE_API ||
      !process.env.GCLOUD_EMAIL ||
      !process.env.GCLOUD_PRIVATE_KEY
    ) {
      const parameters = await getParameters();
      process.env.BOT_TOKEN = parameters['sarve-bot-parameter-store-token'];
      process.env.YOUTUBE_API = parameters['youtube-api-parameter-store'];
      process.env.GCLOUD_EMAIL = parameters['gcloud-sarve-bot-email'];
      process.env.GCLOUD_PRIVATE_KEY = parameters['gcloud-sarve-bot-private-key'];
    }

    new SarveBot(client);
    await client.login(process.env.BOT_TOKEN);
  } catch (err) {
    console.log(err);
  }
}

main();
