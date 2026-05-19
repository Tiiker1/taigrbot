<h1 align="center">TaigrBot</h1>

<p align="center">
  <img src="https://img.shields.io/badge/discord.js-v14.26-%235865F2?logo=discord&logoColor=white" alt="discord.js">
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white" alt="node">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="license">
  <img src="https://img.shields.io/badge/status-active-success" alt="status">
</p>

<p align="center">
  A multi-server Discord bot with slash commands, scam protection,<br>
  Steam integrations, and temporary voice channels.
</p>

---

## ✨ Features

- **Slash Commands** — Fully registered and auto-deployed with change detection
- **Scam Protection** — Detects suspicious URLs, issues warnings, and auto-kicks repeat offenders
- **Temporary Voice Channels** — On-demand voice channels that clean up after inactivity
- **Steam Integration** — Query CS2 stats and game playtime via the Steam API
- **Activity Rotation** — Dynamic presence updates across all guilds
- **Auto-Cleanup** — Deprecated commands are removed from Discord on startup

---

## 📋 Commands

| Command | Description |
|---|---|
| `/help` | Lists all available commands grouped by category |
| `/botinfo` | Bot username, ID, server count, and uptime |
| `/uptime` | How long the bot has been online |
| `/ping` | Simple latency check |
| `/fact` | Random useless fact |
| `/joke` | Random joke |
| `/meme` | Random meme image |
| `/quote` | Random quote |
| `/sus` | Check or increment a user's sus level |
| `/cs2stats` | CS2 playtime and achievements from Steam |
| `/steamstat` | Playtime for all owned Steam games |
| `/tempvoice` | Create a temporary voice channel |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18 (native `fetch` support)
- A [Discord application](https://discord.com/developers/applications) with a bot token
- (Optional) A [Steam API key](https://steamcommunity.com/dev/apikey)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd taigrbot

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
STEAM_API_KEY=your_steam_api_key_here   # optional
```

Start the bot:

```bash
npm start
```

---

## 📁 Project Structure

```
taigrbot/
├── bot.js                    # Entry point
├── handlers/
│   ├── commandHandler.js     # Recursive command loader
│   ├── eventHandler.js       # Event loader
│   └── deployCommands.js     # Slash command deployment & cleanup
├── commands/
│   ├── bot/                  # botinfo, uptime
│   ├── random/               # fact, joke, meme, quote, sus
│   └── utility/              # cs2stats, ping, steamstat, tempvoice
├── events/
│   ├── antiscam.js           # Scam link detection & enforcement
│   └── clientReady.js        # Presence rotation on ready
└── .env                      # Environment variables (not tracked)
```

---

## 🛡️ Scam Protection

The anti-scam system monitors every message for suspicious URLs. On detection:

1. The message is deleted
2. The user receives a DM warning
3. A public warning is sent to the channel
4. After **2 warnings**, the user is kicked from the server

All incidents are logged to `scam_log.json`.

---

## 🧪 Tech Stack

- **[discord.js](https://discord.js.org) v14** — Discord API wrapper
- **Node.js** — Runtime
- **[Steam Web API](https://steamcommunity.com/dev)** — Game stats
- **[axios](https://axios-http.com)** — HTTP requests for external APIs
- **[dotenv](https://github.com/motdotla/dotenv)** — Environment management
