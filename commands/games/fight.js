const { SlashCommandBuilder } = require('discord.js');

const outcomes = [
  (a, b) => `${a} slipped on a banana peel mid-fight. ${b} wins! 🍌`,
  (a, b) => `${a} landed a critical hit and sent ${b} flying into the void!`,
  (a, b) => `Both ${a} and ${b} knocked each other out. It’s a draw 💤`,
  (a, b) => `${b} surrendered immediately. ${a} wins by default.`,
  (a, b) => `${a} started dancing and confused ${b} into submission.`,
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Start a ridiculous fight between two users')
    .addUserOption(option =>
      option.setName('user1')
        .setDescription('Fighter 1')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user2')
        .setDescription('Fighter 2')
        .setRequired(true)),

  async execute(interaction) {
    const user1 = interaction.options.getUser('user1').username;
    const user2 = interaction.options.getUser('user2').username;
    const result = outcomes[Math.floor(Math.random() * outcomes.length)](user1, user2);
    await interaction.reply(`⚔️ Fight!\n${result}`);
  }
};
