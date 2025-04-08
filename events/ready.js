module.exports = async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Simple activity
    client.user.setActivity("Playing with code!", { type: "PLAYING" });

    console.log("Bot is now online and ready!");
};
