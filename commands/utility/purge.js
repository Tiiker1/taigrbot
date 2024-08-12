const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Clears a specified number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)),
  async execute(interaction) {
    // Get the number of messages to delete
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: 'You need to specify a number between 1 and 100.', ephemeral: true });
    }

    try {
      // Fetch the messages to delete
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      
      // Bulk delete messages
      await interaction.channel.bulkDelete(messages);

      await interaction.reply({ content: `Successfully deleted ${amount} message(s).`, ephemeral: true });
    } catch (error) {
      console.error('Error purging messages:', error);
      await interaction.reply({ content: 'There was an error trying to delete messages.', ephemeral: true });
    }
  },
};
