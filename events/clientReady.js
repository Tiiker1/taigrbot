const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,

  execute(client) {
    console.log(`✅ Logged in as ${client.user.username}!`);

    try {
      const activities = [
        () => ({ name: 'tiiker1', type: ActivityType.Playing }),
        () => ({ name: 'your commands ✨', type: ActivityType.Listening }),
        () => ({ name: `${client.guilds.cache.size} servers 🌍`, type: ActivityType.Watching }),
        () => ({ name: `${client.users.cache.size} users 💡`, type: ActivityType.Watching }),
        () => ({ name: 'coding taigrbot 🚀', type: ActivityType.Competing }),
      ];

      const INTERVAL = 30_000;

      const setRandomActivity = () => {
        if (!activities.length) return;

        const activity = activities[Math.floor(Math.random() * activities.length)]();
        client.user.setPresence({
          status: 'online',
          activities: [activity],
        });

        console.log(`🌟 Presence updated → ${activity.type} ${activity.name}`);
      };

      setRandomActivity();
      setInterval(setRandomActivity, INTERVAL);

      console.log(`🔄 Presence rotation started (every ${INTERVAL / 1000}s).`);
    } catch (error) {
      console.error('❌ Error setting presence:', error);
    }
  },
};
