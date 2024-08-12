const { SlashCommandBuilder } = require('@discordjs/builders');
const randomUsernameGenerator = require('random-username-generator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('username')
    .setDescription('Generate a random username.'),
  async execute(interaction) {
    const username = randomUsernameGenerator.generate();
    await interaction.reply(`Generated username: ${username}`);
  },
};
