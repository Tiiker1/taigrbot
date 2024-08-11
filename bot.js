const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');

// Initialize the client with updated intents
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Config
const config = require('./config.json');

// Initialize commands collection
client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Deploy commands
const commands = [];
for (const command of client.commands.values()) {
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    // Collect existing commands
    const existingCommands = await rest.get(Routes.applicationGuildCommands(config.clientId, config.guildId));

    // Create a map for quick lookup
    const existingCommandsMap = new Map(existingCommands.map(cmd => [cmd.name, cmd.id]));

    // Identify commands to delete
    const commandsToDelete = existingCommands.filter(existingCommand => 
      !commands.some(cmd => cmd.name === existingCommand.name)
    );

    // Delete old commands
    for (const commandToDelete of commandsToDelete) {
      try {
        await rest.delete(Routes.applicationGuildCommand(config.clientId, config.guildId, commandToDelete.id));
        console.log(`Deleted old command: ${commandToDelete.name}`);
      } catch (error) {
        console.error(`Error deleting command ${commandToDelete.name}:`, error);
      }
    }

    // Register new commands
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

// Event handlers
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Login to Discord
client.login(config.token);