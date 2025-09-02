const fs = require('fs');
const path = require('path');

function loadEvents(client, eventsPath = path.join(__dirname, '..', 'events')) {
  const files = fs.readdirSync(eventsPath);

  for (const file of files) {
    const fullPath = path.join(eventsPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      loadEvents(client, fullPath);
      continue;
    }

    if (!file.endsWith('.js')) continue;

    try {
      const event = require(fullPath);

      if (!event.name || !event.execute) {
        console.warn(`⚠️ Skipped invalid event: ${fullPath}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`📡 Loaded event: ${event.name}`);
    } catch (err) {
      console.error(`❌ Failed to load event: ${fullPath}`, err);
    }
  }
}

module.exports = { loadEvents };
