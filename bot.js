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
// Function to load all commands from the 'commands' folder and subfolders
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
        console.error(`Failed to load command from ${fullPath}:`, error);
      }
    }
  });
}

loadCommands(path.join(__dirname, 'commands'));

// Prepare commands to be sent to Discord API
const commands = [];
client.commands.forEach(command => {
  commands.push(command.data.toJSON());
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    // Get the existing commands from Discord
    const existingCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));

    const existingCommandsMap = new Map(existingCommands.map(cmd => [cmd.name, cmd.id]));

    // Find commands that no longer exist in the code and need to be deleted
    const commandsToDelete = existingCommands.filter(existingCommand =>
      !commands.some(cmd => cmd.name === existingCommand.name)
    );

    // Delete old commands
    for (const commandToDelete of commandsToDelete) {
      try {
        await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, commandToDelete.id));
        console.log(`Removed old command: ${commandToDelete.name}`);
      } catch (error) {
        console.error(`Failed to delete command ${commandToDelete.name}:`, error);
      }
    }

    // Register the new commands globally
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Successfully registered commands globally.');

  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// Handle interactions like slash commands
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
    console.error(`Error executing command ${interaction.commandName}:`, error);
    await interaction.reply({ content: 'Oops, something went wrong!', ephemeral: true });
  }
});

// Load event listeners from the 'events' folder
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

// Log in to Discord using the bot's token
client.login(process.env.DISCORD_TOKEN);
