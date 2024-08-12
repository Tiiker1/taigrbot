const { SlashCommandBuilder } = require('@discordjs/builders');
const crypto = require('crypto');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('password')
    .setDescription('Generate a random secure password.')
    .addIntegerOption(option => 
      option.setName('length')
        .setDescription('Length of the password')
        .setRequired(true)),
  async execute(interaction) {
    const length = interaction.options.getInteger('length');
    if (length <= 0) {
      return await interaction.reply('Please specify a positive length.');
    }

    const password = crypto.randomBytes(length).toString('base64').slice(0, length);
    await interaction.reply(`Generated password: ${password}`);
  },
};