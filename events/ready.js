const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',

    async execute(client) {  // Add async here
        console.log(`Logged in as ${client.user.tag}!`);

        // If you have the `commands` variable or array that needs to be set, ensure it's defined
        // For example: const commands = [/* your command list */];
        await client.application.commands.set(commands); // Corrected with 'await' in an async function

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
                        largeImage: 'embedded_background',
                        large_text: 'Exploring the final frontier',
                        smallImage: 'bot_avatar_icon',
                        small_text: 'Pilot Level: Master'
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
