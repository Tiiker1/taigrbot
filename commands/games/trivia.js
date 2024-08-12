const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

const TRIVIA_API_URL = 'https://opentdb.com/api.php';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Get a random trivia question.'),
  async execute(interaction) {
    try {
      const response = await axios.get(TRIVIA_API_URL, {
        params: {
          amount: 1,
          type: 'multiple'
        }
      });
      const trivia = response.data.results[0];
      const question = trivia.question;
      const correctAnswer = trivia.correct_answer;
      const incorrectAnswers = trivia.incorrect_answers;
      const allAnswers = [correctAnswer, ...incorrectAnswers].sort();

      const answersString = allAnswers.map((ans, index) => `${index + 1}. ${ans}`).join('\n');

      await interaction.reply(`**Trivia Question:** ${question}\n\n${answersString}\n\n**Type the number of your answer.**`);
    } catch (error) {
      console.error('Error fetching trivia:', error);
      await interaction.reply('Sorry, I couldn\'t fetch trivia at the moment.');
    }
  },
};
