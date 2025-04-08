const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',

    execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);

        try {
            client.user.setPresence({
                status: 'online',
                afk: false,
                activities: [{
                    name: 'Galactic Exploration',
                    type: ActivityType.Playing,
                    details: 'Voyaging through the digital cosmos',
                    state: 'Discovering new worlds',
                    
                    timestamps: {
                        start: new Date(),
                        end: new Date(Date.now() + (60 * 60 * 1000)) // Ends in one hour
                    },

                    // Setting the asset images using keys from Developer Portal
                    assets: {
                        largeImage: 'embedded_background', // Key for the large image asset in Rich Presence
                        large_text: 'Exploring the final frontier', // Tooltip text for large image
                        smallImage: 'bot_avatar_icon', // Key for the small image asset
                        small_text: 'Pilot Level: Master' // Tooltip text for small image
                    },

                    party: {
                        id: 'unique-party-id',
                        size: [3, 5]
                    },

                    secrets: {
                        join: 'unique-join-code'
                    }
                }]
            });

            console.log('Presence set successfully with images!');
        } catch (error) {
            console.error('Error setting presence:', error);
        }
    },
};
