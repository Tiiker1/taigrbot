const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadCommands(client, commandsPath = path.join(__dirname, '..', 'commands')) {
  client.commands = new Collection();

  function walk(dir, parentDir = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath, path.join(parentDir, file));
        continue;
      }

      if (!file.endsWith('.js')) continue;

      try {
        const command = require(fullPath);

        if (!command.data || !command.execute) {
          console.warn(`⚠️ Skipped invalid command: ${fullPath}`);
          continue;
        }

        if (client.commands.has(command.data.name)) {
          console.warn(`⚠️ Duplicate command: ${command.data.name}`);
          continue;
        }

        command.category = parentDir || 'General';
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } catch (err) {
        console.error(`❌ Failed to load command: ${fullPath}`, err);
      }
    }
  }

  walk(commandsPath);
}

module.exports = { loadCommands };
