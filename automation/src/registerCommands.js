import 'dotenv/config';
import fetch from 'node-fetch';
import { slashCommands } from './commands.js';

async function main() {
  const applicationId = process.env.DISCORD_APPLICATION_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!applicationId || !botToken) {
    throw new Error('DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN required');
  }
  const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(slashCommands)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord error ${res.status}: ${text}`);
  }
  console.log(`Registered ${slashCommands.length} commands.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
