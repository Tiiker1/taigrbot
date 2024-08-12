const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios'); // Ensure you have this installed

const API_URL = 'https://uselessfacts.jsph.pl/random.json?language=en';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random fact.'),
  async execute(interaction) {
    try {
      const response = await axios.get(API_URL);
      await interaction.reply(`Did you know? ${response.data.text}`);
    } catch (error) {
      console.error('Error fetching fact:', error);
      await interaction.reply('Sorry, I couldn\'t fetch a fact at the moment.');
    }
  },
};