const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

const QUOTE_API_URL = 'https://api.quotable.io/random';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Generate a random quote.'),
  async execute(interaction) {
    try {
      const response = await axios.get(QUOTE_API_URL);
      const quote = response.data;
      await interaction.reply(`"${quote.content}" - ${quote.author}`);
    } catch (error) {
      console.error('Error fetching quote:', error);
      await interaction.reply('Sorry, I couldn\'t fetch a quote at the moment.');
    }
  },
};
