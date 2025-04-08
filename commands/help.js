const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Provides information about available commands.'),
  async execute(interaction) {
    // Get all commands from the client
    const commands = interaction.client.commands;

    // Create an embed for the command list
    const embed = new EmbedBuilder()
      .setTitle('📜 Available Commands')
      .setDescription('Here is a list of all available commands:')
      .setColor('#0099ff') // Customize the color
      .setThumbnail('https://example.com/your-thumbnail.png') // Optional: add a thumbnail
      .setFooter({ text: 'taigrbot', iconURL: 'https://example.com/your-bot-icon.png' }); // Optional: add footer

    // Group commands by category
    const commandCategories = new Map();

    commands.forEach(command => {
      const category = command.category || 'General'; // Default to 'General' if no category
      if (!commandCategories.has(category)) {
        commandCategories.set(category, []);
      }
      commandCategories.get(category).push(command);
    });

    // Add fields to the embed
    commandCategories.forEach((commands, category) => {
      let fieldValue = commands.map(cmd => `**/${cmd.data.name}**: ${cmd.data.description || 'No description provided'}`).join('\n');
      
      embed.addFields({
        name: `📁 ${category}`,
        value: fieldValue,
        inline: false // Avoid using inline for long descriptions
      });
    });

    // Reply to the interaction with the embed
    await interaction.reply({ embeds: [embed] });
  },
};
