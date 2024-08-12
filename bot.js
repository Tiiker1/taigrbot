const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

// Initialize the client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const path = require('path');

// Load commands (with subfolders) and store category information
function loadCommands(dir, parentDir = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath, path.join(parentDir, file));
    } else if (file.endsWith('.js')) {
      try {
        // Construct the relative path from the base directory
        const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
        const command = require(`./${relativePath}`);
        command.category = parentDir || 'General'; // Assign category based on folder path
        client.commands.set(command.data.name, command);
      } catch (error) {
        console.error(`Error loading command from file ${fullPath}:`, error);
      }
    }
  }
}
loadCommands(path.join(__dirname, 'commands'));

// Deploy commands
const commands = [];
for (const command of client.commands.values()) {
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    const existingCommands = await rest.get(Routes.applicationGuildCommands(config.clientId, config.guildId));
    const existingCommandsMap = new Map(existingCommands.map(cmd => [cmd.name, cmd.id]));
    const commandsToDelete = existingCommands.filter(existingCommand => 
      !commands.some(cmd => cmd.name === existingCommand.name)
    );

    for (const commandToDelete of commandsToDelete) {
      try {
        await rest.delete(Routes.applicationGuildCommand(config.clientId, config.guildId, commandToDelete.id));
        console.log(`Deleted old command: ${commandToDelete.name}`);
      } catch (error) {
        console.error(`Error deleting command ${commandToDelete.name}:`, error);
      }
    }

    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();

// Handle interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName} command:`, error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Load events from the 'events' directory
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Login to Discord
client.login(config.token);
