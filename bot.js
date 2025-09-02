require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { deployCommands } = require('./handlers/deployCommands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
});

// Load everything
loadCommands(client);
loadEvents(client);

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  deployCommands(client);
});

// Error handling
process.on('unhandledRejection', err => console.error('🚨 Unhandled Rejection:', err));
process.on('uncaughtException', err => console.error('🚨 Uncaught Exception:', err));

client.login(process.env.DISCORD_TOKEN);
