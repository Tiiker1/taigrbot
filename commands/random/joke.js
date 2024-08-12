const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

const JOKE_API_URL = 'https://official-joke-api.appspot.com/random_joke';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke.'),
  async execute(interaction) {
    try {
      const response = await axios.get(JOKE_API_URL);
      const joke = response.data;

      await interaction.reply(`${joke.setup}\n${joke.punchline}`);
    } catch (error) {
      console.error('Error fetching joke:', error);
      await interaction.reply('Sorry, I couldn\'t fetch a joke at the moment.');
    }
  },
};
