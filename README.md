# 🔍 Premium Telegram Chat ID Finder & Media Analyzer Bot

[![Telegram](https://img.shields.io/badge/Telegram-Bot-blue.svg?logo=telegram)](https://t.me/BangaBandhuSheikhMujiburRahman)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Framework](https://img.shields.io/badge/Framework-grammY-purple.svg)](https://grammy.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A high-performance, aesthetically stunning, and feature-rich Telegram Bot built using **TypeScript** and the modern **grammY** framework. This bot acts as an ultimate developer's Swiss Army Knife, allowing users to instantly find Telegram IDs, extract complete metadata for any media type, inspect groups/channels, and inspect raw API JSON logs.

---

## ✨ Features

- 👤 **Instant Profile Analyzer:** `/start` automatically fetches your latest profile photo and displays all your profile information with premium bordering.
- ⚙️ **View Raw JSON Exporter:** Under every single query, an inline button lets developers view the raw JSON payload. If the JSON is too large for Telegram's message limit, it auto-converts and uploads it as an in-memory `.json` file!
- 📥 **Raw Avatar Exporter:** Instantly download high-resolution profile pictures or shared chat photos as uncompressed document files.
- 🎨 **Media Metadata Analyzer:** Send or forward any media file directly to the bot to inspect technical specifications:
  - **Stickers & Custom Emojis:** Dimensions, set names, animation markers, emojis, and system file IDs.
  - **Photos & Videos:** High-res dimensions, durations, mime types, and file sizes.
  - **Audio & Voice Notes:** Performer info, durations, and bitrates.
  - **Documents & Video Notes:** Filenames, circular note sizes, and format details.
- 🛡️ **Chat Admin Inspector (`/inspect`):** Execute `/inspect` inside groups or `/inspect [chat_id]` privately to retrieve group titles, member counts, and detailed administrator privilege audits.
- ➡️ **Forward Origin Decoder:** Forward any message to the bot to reveal the sender's true ID (even works for hidden users with strict forward privacy!).
- 📋 **Type-Safe & Error-Hardened:** Robust HTML character escaping prevents rendering crashes from special characters in user names or chat titles.

---

## 🛠️ Architecture & Deployment

The bot supports **Telegram Serverless** directly on Telegram's official infrastructure with zero server maintenance, while maintaining standalone compatibility:

- **Serverless Runtime:** Native Telegram Serverless V8 Isolates (`tgcloud`)
- **Built-in Database:** Persistent SQLite via `@tgcloud/cli`
- **Zero-Server Hosting:** Deployed straight to Telegram's cloud — no VPS, no Docker, no Coolify required!
- **Standalone Runtime (Optional):** Node.js + TypeScript + grammY for self-hosted instances

---

## ⚡ Telegram Serverless Deployment (Recommended)

Run your bot on Telegram's high-speed cloud infrastructure without managing servers:

### 1. Enable Serverless on Telegram
1. Open [@BotFather](https://t.me/BotFather) on Telegram.
2. Select your bot → **Serverless** → turn it **ON**.
3. Go to **CLI Access** → copy your **Access Token** (`app<id>:<secret>`).

### 2. Link your local project
Run the login command in your terminal:
```bash
npm run login
# or: npx tgcloud login
```
Paste your CLI Access Token when prompted.

### 3. Deploy Code and Apply Database Migrations
Deploy your modules and run the SQLite schema migration:
```bash
npm run deploy     # Deploys modules to Telegram cloud (npx tgcloud push)
npm run migrate    # Creates the SQLite persistent cache table (npx tgcloud migrate)
```

Your bot is now 100% live on Telegram's serverless cloud!

### 4. Useful Management Commands
- `npm run status` — Inspect local differences vs deployed cloud modules.
- `npm run diff` — View line-by-line diffs against the cloud snapshot.
- `npm run webhook` — Check if your bot webhook is synchronized with deployed handlers.
- `npm run run handlers/message '{ chat: { id: 1 }, text: "/start" }'` — Test-run handlers server-side without deploying.

---

## 🖥️ Alternative: Running as Standalone Node.js Bot (Self-Hosted)

If you ever wish to run the bot on your own server or VPS using Long Polling:
```bash
npm run dev:standalone     # Hot-reloading with tsx
npm run build:standalone   # Compile TypeScript
npm run start:standalone   # Start Node.js service
```

---

## 📱 Bot Commands

| Command | Description | Location |
| :--- | :--- | :--- |
| `/start` | View your own profile details, fetch your avatar, and launch the custom keyboard. | Private Chats |
| `/help` | Display a detailed help manual, usage guide, and credits links. | All Chats |
| `/inspect` | Inspect statistics and a complete admin list for the current group. | Groups & Channels |
| `/inspect [id]` | Inspect group/channel details by supplying its numeric Chat ID. | Private Chats |

---

## 👨‍💻 Creator & Credits

* **Bot Created By:** [MrBongoBoltu](https://t.me/BangaBandhuSheikhMujiburRahman) (embedded profile: `@BangaBandhuSheikhMujiburRahman`)
* **Open Source Repository:** [GitHub Link](https://github.com/ImranVibes/Chat-ID-Finder-Bot)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
