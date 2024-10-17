const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cs2stats')
    .setDescription('Get CS2 playing hours from Steam')
    .addStringOption(option =>
      option.setName('steamid')
        .setDescription('Enter the Steam ID or custom URL name')
        .setRequired(true)),
    
  async execute(interaction) {
    const steamId = interaction.options.getString('steamid');
    const apiKey = 'YOUR_STEAM_API'; // Replace with your Steam API key

    const fetch = (await import('node-fetch')).default;

    try {
      // Fetch owned games for the user
      const gamesResponse = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_played_free_games=1&include_appinfo=1`);

      if (!gamesResponse.ok) {
        const errorText = await gamesResponse.text();
        console.error(`Error fetching games: ${errorText}`);
        return await interaction.reply({ content: 'There was an error fetching the CS2 stats. Please check the Steam ID or try again later.', ephemeral: true });
      }

      const gamesData = await gamesResponse.json();
      const cs2Game = gamesData.response.games.find(game => game.appid === 730); // 730 is the App ID for CS2

      if (!cs2Game) {
        return await interaction.reply({ content: 'This player does not own CS2 or has not played it yet.', ephemeral: true });
      }

      // Retrieve total playtime (in minutes)
      const playtimeHours = (cs2Game.playtime_forever / 60).toFixed(2); // Convert minutes to hours

      // Fetch achievements for the user
      const achievementsResponse = await fetch(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${apiKey}&steamid=${steamId}`);
      const achievementsData = await achievementsResponse.json();

      const achievementsCount = achievementsData.playerstats?.achievements.length || 0;

      // User summary
      const playerResponse = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`);
      const playerData = await playerResponse.json();

      if (!playerData.response.players.length) {
        return await interaction.reply({ content: 'Could not retrieve player information.', ephemeral: true });
      }

      const player = playerData.response.players[0];

      const statsMessage = `
        **Player:** ${player.personaname}
        **Steam Profile:** [View Profile](${player.profileurl})
        **Avatar:** [Avatar](${player.avatarfull})
        **Total Playtime in CS2:** ${playtimeHours} hours
        **Achievements Unlocked:** ${achievementsCount}
        **Total Matches Played:** Not available through the Steam API
      `;

      await interaction.reply(statsMessage);
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply({ content: 'There was an error fetching the CS2 playtime.', ephemeral: true });
    }
  },
};
