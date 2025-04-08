// Load environment variables from the .env file
require('dotenv').config();

// Discord.js imports, plus some other helpful stuff
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialize the Discord bot client with the right permissions
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Allows access to guild info
    GatewayIntentBits.GuildMessages, // To read messages in guilds
    GatewayIntentBits.GuildPresences, // To track when users come and go
    GatewayIntentBits.MessageContent, // So we can read the content of messages
  ]
});

// Create a new collection to store our commands in
client.commands = new Collection();

// This function is responsible for loading commands from folders, including subfolders
function loadCommands(dir, parentDir = '') {
  // Read everything in the directory
  const files = fs.readdirSync(dir);

  // Loop through each file in the directory
  files.forEach(file => {
    const fullPath = path.join(dir, file); // Get the full path to the file

    if (fs.statSync(fullPath).isDirectory()) {
      // If it's a directory, call the function again to load commands inside it
      loadCommands(fullPath, path.join(parentDir, file));
    } else if (file.endsWith('.js')) {
      // If it's a JavaScript file, load it as a command
      try {
        // Generate the relative path to load the command
        const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
        const command = require(`./${relativePath}`);

        // Assign a category based on the folder it's in (or 'General' if no folder)
        command.category = parentDir || 'General';

        // Add the command to the collection, using its name as the key
        client.commands.set(command.data.name, command);
      } catch (error) {
        console.error(`Could not load command from ${fullPath}:`, error);
      }
    }
  });
}

// Load commands from the 'commands' directory (including subfolders)
loadCommands(path.join(__dirname, 'commands'));

// Prepare the commands array to send to Discord
const commands = [];
client.commands.forEach(command => {
  commands.push(command.data.toJSON());
});

// Set up the REST client for making API requests to Discord
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// This part registers (or re-registers) the bot's commands with Discord
(async () => {
  try {
    // Get all commands that are currently registered on Discord
    const existingCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID));
    
    // Map the existing commands by their names so we can easily find them
    const existingCommandsMap = new Map(existingCommands.map(cmd => [cmd.name, cmd.id]));

    // Find commands that exist in Discord but aren't in the new list, so we can delete them
    const commandsToDelete = existingCommands.filter(existingCommand =>
      !commands.some(cmd => cmd.name === existingCommand.name)
    );

    // Loop through commands that need to be deleted
    for (const commandToDelete of commandsToDelete) {
      try {
        await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, process.env.GUILD_ID, commandToDelete.id));
        console.log(`Deleted old command: ${commandToDelete.name}`);
      } catch (error) {
        console.error(`Error deleting command ${commandToDelete.name}:`, error);
      }
    }

    // Register the new commands with Discord
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();

// Listen for interactions like slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return; // Ignore anything that's not a command

  // Check if the command exists in our collection
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command found with the name ${interaction.commandName}`);
    return;
  }

  try {
    // Try executing the command
    await command.execute(interaction);
  } catch (error) {
    // If something goes wrong, log the error and reply to the user
    console.error(`Error executing ${interaction.commandName}:`, error);
    await interaction.reply({ content: 'Whoops, something went wrong!', ephemeral: true });
  }
});

// Now, let's load all the event listeners from the 'events' folder
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Register each event handler
eventFiles.forEach(file => {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    // If the event is supposed to only fire once, we use `once()`
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    // For regular events, we use `on()`
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// Log in with the token from the .env file
client.login(process.env.DISCORD_TOKEN);
