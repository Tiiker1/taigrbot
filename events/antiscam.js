const fs = require('fs');
const path = require('path');

const scamLogFilePath = path.join(__dirname, '..', 'scam_log.json');
let scamLogs = fs.existsSync(scamLogFilePath) ? require(scamLogFilePath) : [];

const scamPhrases = [
  /free\s*n\w*t\w*ro/i,
  /discord\s*giveaway/i,
  /claim\s*prize/i,
  /congratulations\s*you\s*won/i,
  /limited\s*time\s*offer/i,
  /send\s*me\s*(a\s*)?steam\s*(gift\s*)?card/i,
  /buy\s*(a\s*)?steam\s*code/i,
  /redeem\s*steam\s*gift\s*card/i,
  /free\s*steam\s*items/i,
  /i\s*accidentally\s*reported\s*you\s*on\s*steam/i,
  /send\s*me\s*your\s*trade\s*offer/i,
  /trade\s*link.*https?:\/\//i,
  /i\s*can\s*duplicate\s*your\s*items/i
];

const scamUrls = [
  /(https?:\/\/)?(www\.)?[\w\-]+(\.xyz|\.top|\.gq|\.win|\.click|\.lol|\.gift|\.zip|\.monster|\.icu|\.link)(\/\S*)?/i,
  /https?:\/\/(steamcommunity|steamncommunnity|steampowered|steamcommnunity|steamcornmunity|stearnc0mmunity)\.\w{2,10}\//i,
  /https?:\/\/.*(free-nitro|free-steam|nitro-free|steam-gift)\.\w{2,}/i
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
  execute(message, client) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const scamDetected = scamPhrases.some(pattern => pattern.test(content));
    const urlDetected = scamUrls.some(pattern => pattern.test(content));
    const hasAttachments = message.attachments.size > 0;

    if (scamDetected || urlDetected || hasAttachments) {
      message.delete().catch(() => {});
      message.author.send(
        '🚨 Your message was flagged and removed due to potential scam content (Steam/gift/Nitro scam or suspicious links). If this was a mistake, please contact a server moderator.'
      ).catch(() => {});

      let reason = 'Scam detected via message content';
      if (urlDetected) reason = 'Suspicious URL detected';
      if (hasAttachments) reason = 'Suspicious attachments detected';

      logScam(message.guild?.id || 'DM', message.author.id, message.content, reason);
    }
  },
};
