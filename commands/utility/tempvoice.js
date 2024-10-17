const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvoice')
    .setDescription('Create a temporary voice channel')
    .addStringOption(option =>
      option.setName('channelname')
        .setDescription('Name of the temporary voice channel')
        .setRequired(true)),
    
  async execute(interaction) {
    const channelName = interaction.options.getString('channelname');

    if (!channelName) {
      return await interaction.reply({ content: 'You must provide a channel name.', ephemeral: true });
    }

    const guild = interaction.guild;

    try {
      // Create the temporary voice channel
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        userLimit: 5,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
          },
        ],
      });

      await interaction.reply(`Temporary voice channel **${channel.name}** created!`);

      // Set a timer to delete the channel after 10 minutes of inactivity
      let timer;

      const checkChannelMembers = () => {
        if (channel.members.size === 0) {
          timer = setTimeout(async () => {
            await channel.delete('Temporary voice channel deleted due to inactivity');
            console.log(`Deleted voice channel: ${channel.name}`);
          }, 10 * 60 * 1000); // 10 minutes
        }
      };

      // Initial check
      checkChannelMembers();

    } catch (error) {
      console.error('Error creating temp voice channel:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error creating the temporary voice channel.', ephemeral: true });
      }
    }
  },
};
