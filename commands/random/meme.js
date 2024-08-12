const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

const MEME_API_URL = 'https://meme-api.com/gimme';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme.'),
  async execute(interaction) {
    try {
      const response = await axios.get(MEME_API_URL);
      const meme = response.data;
      await interaction.reply(meme.url);
    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.reply('Sorry, I couldn\'t fetch a meme at the moment.');
    }
  },
};