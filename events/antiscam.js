const fs = require('fs');
const path = require('path');

const scamLogFilePath = path.join(__dirname, '..', 'scam_log.json');
let scamLogs = fs.existsSync(scamLogFilePath) ? require(scamLogFilePath) : [];

const warningMap = new Map(); // Key: guildId-userId, Value: warning count

const scamPhrases = [
  /free\s*(n|n1|nitro|n!tro)/i,
  /discord\s*(giveaway|event)/i,
  /claim\s*(your\s*)?(reward|gift|prize)/i,
  /congratulations.*(you\s*won|selected)/i,
  /limited\s*time\s*offer/i,
  /send\s*me\s*(a\s*)?steam\s*(gift\s*)?card/i,
  /buy\s*(a\s*)?steam\s*(wallet\s*)?(code|key)/i,
  /redeem\s*steam\s*gift\s*card/i,
  /free\s*(steam\s*)?(items|skins|games)/i,
  /i\s*(accidentally\s*)?reported\s*you\s*(on\s*)?(steam|discord)/i,
  /send\s*me\s*your\s*trade\s*link/i,
  /trade\s*link.*https?:\/\//i,
  /i\s*can\s*duplicate\s*your\s*(items|skins)/i,
  /verify\s*your\s*(account|identity)/i,
  /(steam|discord).*\s*staff.*(contact|message|ban)/i,
  /this\s*is\s*not\s*a\s*scam/i
];

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
    const scamDetected = scamPhrases.some(pattern => pattern.test(content));
    const urlDetected = scamUrls.some(pattern => pattern.test(content));
    const dangerousExtensions = ['.cmd'];
    const suspiciousAttachment = [...message.attachments.values()].some(att => {
      const ext = path.extname(att.name).toLowerCase();
      return dangerousExtensions.includes(ext);
    });
    
    if (!(scamDetected || urlDetected || suspiciousAttachment)) return;

    await message.delete().catch(() => {});

    const guildId = message.guild.id;
    const userId = message.author.id;
    const key = `${guildId}-${userId}`;
    const currentWarnings = warningMap.get(key) || 0;
    const newWarnings = currentWarnings + 1;
    warningMap.set(key, newWarnings);

    // Log the scam attempt
    let reason = 'Scam content detected';
    if (urlDetected) reason = 'Suspicious URL';
    if (hasAttachments) reason = 'Suspicious attachment';
    logScam(guildId, userId, message.content, reason);

    // Send DM warning
    const dmWarning = [
      "⚠️ **Potential Scam Detected**",
      "",
      "Your message in **" + message.guild.name + "** was removed because it contained scam-like content.",
      `This is warning **#${newWarnings}**.`,
      "",
      "If this was a mistake, contact the server moderators.",
      "",
      "🔐 Avoid suspicious links and never share personal details online."
    ].join('\n');

    await message.author.send({ content: dmWarning }).catch(() => {});

    // Warn in server
    await message.channel.send({
      content: `⚠️ <@${userId}>, your message was removed for containing potential scam content. This is warning **#${newWarnings}**.`
    });

    // Kick on 2nd offense
    if (newWarnings >= 2) {
      const member = message.guild.members.cache.get(userId);
      if (member && member.kickable) {
        await member.kick('Attempted to send scam links to the server.');
        await message.channel.send(`🚫 <@${userId}> was kicked for repeated scam attempts.`);
      } else {
        await message.channel.send(`🚫 <@${userId}> exceeded scam warning limit but could not be kicked.`);
      }
    }
  }
};
