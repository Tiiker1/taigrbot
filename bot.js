require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();

// This function loads all commands from the 'commands' directory, including subfolders
function loadCommands(dir, parentDir = '') {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath, path.join(parentDir, file));
    } else if (file.endsWith('.js')) {
      try {
        const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
        const command = require(`./${relativePath}`);
        command.category = parentDir || 'General';
        client.commands.set(command.data.name, command);
      } catch (error) {
        console.error(`Could not load command from ${fullPath}:`, error);
      }
    }
  });
}

loadCommands(path.join(__dirname, 'commands'));

// Prepare the commands array to send to Discord
const commands = [];
client.commands.forEach(command => {
  commands.push(command.data.toJSON());
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    // Register commands globally
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Successfully registered application commands globally!');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command found with the name ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    await interaction.reply({ content: 'Whoops, something went wrong!', ephemeral: true });
  }
});

// Load event listeners
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
eventFiles.forEach(file => {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

client.login(process.env.DISCORD_TOKEN);
