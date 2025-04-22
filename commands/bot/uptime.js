const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Displays how long the bot has been online'),
  
  async execute(interaction) {
    const uptime = interaction.client.uptime;
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    await interaction.reply(`I have been online for ${days}d ${hours}h ${minutes}m ${seconds}s.`);
  },
};
