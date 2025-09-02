const { REST, Routes } = require('discord.js');

async function deployCommands(client) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commandsJSON = client.commands.map(cmd => cmd.data.toJSON());

  try {
    const existing = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
    const existingMap = new Map(existing.map(cmd => [cmd.name, cmd]));

    // Remove old commands
    for (const old of existing) {
      if (!client.commands.has(old.name)) {
        await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, old.id));
        console.log(`🗑️ Removed old command: ${old.name}`);
      }
    }

    // Check for changes
    const needsUpdate =
      existing.length !== commandsJSON.length ||
      commandsJSON.some(cmd => {
        const ex = existingMap.get(cmd.name);
        return !ex || JSON.stringify(ex) !== JSON.stringify(cmd);
      });

    if (needsUpdate) {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsJSON });
      console.log(`✅ Registered ${commandsJSON.length} commands globally.`);
    } else {
      console.log('⚡ No command changes detected.');
    }
  } catch (err) {
    console.error('❌ Error deploying commands:', err);
  }
}

module.exports = { deployCommands };
