const fs = require('fs');
const path = require('path');

const scamLogFilePath = path.join(__dirname, '..', 'scam_log.json');
let scamLogs = fs.existsSync(scamLogFilePath) ? require(scamLogFilePath) : [];

const warningMap = new Map();

const scamUrls = [
  /(https?:\/\/)?(www\.)?[\w\-]+(\.xyz|\.top|\.gq|\.win|\.click|\.lol|\.gift|\.zip|\.monster|\.icu|\.link|\.ru|\.tk)(\/\S*)?/i,
  /https?:\/\/(steamcommunity|steamncommunnity|steamcommnunity|steamcomrnunity|steampowered|steamcornmunity|steamncom|stearncomm)|discord(nitro)?\.gift/i,
  /https?:\/\/.*(free-nitro|free-steam|nitro-free|steam-gift|discordbonus|nitrodrop)\.\w{2,}/i,
  /https?:\/\/(bit\.ly|tinyurl\.com|is\.gd|cutt\.ly|grabify\.link|gyazo\.pro|linktr\.ee|direct-link\.net)/i
];

function logScam(guildId, userId, content, reason) {
  const logEntry = {
    guildId,
    userId,
    content,
    reason,
    timestamp: new Date().toISOString()
  };
  scamLogs.push(logEntry);
  fs.writeFileSync(scamLogFilePath, JSON.stringify(scamLogs, null, 2));
}

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const content = message.content.toLowerCase();
    const urlDetected = scamUrls.some(pattern => pattern.test(content));
    if (!urlDetected) return;

    await message.delete().catch(() => {});

    const guildId = message.guild.id;
    const userId = message.author.id;
    const key = `${guildId}-${userId}`;
    const currentWarnings = warningMap.get(key) || 0;
    const newWarnings = currentWarnings + 1;
    warningMap.set(key, newWarnings);

    logScam(guildId, userId, message.content, 'Suspicious URL');

    await message.author.send({
      content: [
        "**Scam Link Detected**",
        "",
        `Your message in **${message.guild.name}** was removed because it contained a suspicious link.`,
        `This is warning **#${newWarnings}**.`,
        "",
        "If you believe this was a mistake, please reach out to a server admin or moderator.",
        "Remember to stay safe and avoid clicking suspicious links!",
        "For now also contact or advise server admins/mods to contact tiiker1 if you have problem with bot"
      ].join('\n')
    }).catch(() => {});

    await message.channel.send({
      content: `⚠️ <@${userId}>, your message was removed because it contained a suspicious link. Warning **#${newWarnings}**.`
    });

    if (newWarnings >= 2) {
      const member = message.guild.members.cache.get(userId);
      if (member && member.kickable) {
        await member.kick('Repeated attempt to send scam links.');
        await message.channel.send(`🚫 <@${userId}> has been kicked for repeatedly attempting to send scam links.`);
      }
    }
  }
};
