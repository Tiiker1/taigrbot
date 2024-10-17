const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steamstat')
    .setDescription('Get playing hours of all games owned by the user')
    .addStringOption(option =>
      option.setName('steamid')
        .setDescription('Enter the Steam ID or custom URL name')
        .setRequired(true)),
    
  async execute(interaction) {
    const steamId = interaction.options.getString('steamid');
    const apiKey = 'YOUR_STEAM_API_KEY'; // Replace with your Steam API key

    const fetch = (await import('node-fetch')).default;

    try {
      // Fetch owned games for the user
      const gamesResponse = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_played_free_games=1&include_appinfo=1`);

      if (!gamesResponse.ok) {
        const errorText = await gamesResponse.text();
        console.error(`Error fetching games: ${errorText}`);
        return await interaction.reply({ content: 'There was an error fetching the Steam stats. Please check the Steam ID or try again later.', ephemeral: true });
      }

      const gamesData = await gamesResponse.json();
      const games = gamesData.response.games;

      // Filter games with non-zero playtime
      const playedGames = games.filter(game => game.playtime_forever > 0);

      if (playedGames.length === 0) {
        return await interaction.reply({ content: 'This player has no games with recorded playtime.', ephemeral: true });
      }

      // Format the message
      const statsMessage = playedGames.map(game => {
        const playtimeHours = (game.playtime_forever / 60).toFixed(2); // Convert minutes to hours
        return `**${game.name}:** ${playtimeHours} hours`;
      }).join('\n');

      await interaction.reply(`**Playing Hours of Owned Games:**\n${statsMessage}`);
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply({ content: 'There was an error fetching the Steam stats.', ephemeral: true });
    }
  },
};
