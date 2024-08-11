const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Provides information about available commands.'),
  async execute(interaction) {
    // Get all commands from the client
    const commands = interaction.client.commands;

    // Create an embed for the command list
    const embed = new EmbedBuilder()
      .setTitle('Available Commands')
      .setDescription('Here is a list of all available commands:')
      .setColor('#00FF00'); // You can customize the color

    // Loop through each command and add it to the embed
    commands.forEach(command => {
      embed.addFields({
        name: `/${command.data.name}`, // Command name
        value: command.data.description || 'No description provided', // Command description
        inline: true // Inline field
      });
    });

    // Reply to the interaction with the embed
    await interaction.reply({ embeds: [embed] });
  },
};
