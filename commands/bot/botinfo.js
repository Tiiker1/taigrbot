const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Displays information about the bot'),
  
  async execute(interaction) {
    const { client } = interaction;
    await interaction.reply(`Bot username: ${client.user.username}\nID: ${client.user.id}\nServers: ${client.guilds.cache.size}\nUptime: ${Math.round(client.uptime / 1000)} seconds\nVersion:1.0.0`);
  },
};
