const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const susDataFile = path.join(__dirname, '..', 'data', 'sus.json');

// Make sure the data folder exists
if (!fs.existsSync(path.dirname(susDataFile))) {
  fs.mkdirSync(path.dirname(susDataFile));
}

// Load or initialize sus data
let susData = {};
if (fs.existsSync(susDataFile)) {
  susData = JSON.parse(fs.readFileSync(susDataFile));
}

function saveSusData() {
  fs.writeFileSync(susDataFile, JSON.stringify(susData, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sus')
    .setDescription('Check or increase a user\'s sus level.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to check or increase sus level')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('add')
        .setDescription('Add sus point instead of checking')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('target');
    const add = interaction.options.getBoolean('add') || false;

    const userId = user.id;
    susData[userId] = susData[userId] || 0;

    if (add) {
      susData[userId]++;
      saveSusData();
      await interaction.reply(`${user} is acting sus 👀\n**Sus Points: ${susData[userId]}**`);
    } else {
      await interaction.reply(`${user} currently has **${susData[userId]}** sus point(s).`);
    }
  }
};
