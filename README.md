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

## 🛠️ Technology Stack

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Framework:** [grammY](https://grammy.dev/) (Type-safe and modern Telegram Bot API framework)
- **Execution engine:** `tsx` (TypeScript Execute for zero-compilation hot-reloading)
- **Environment:** `dotenv` for secure environment variable loading

---

## 🚀 Getting Started

Follow these simple steps to run the bot locally on your computer:

### 1. Prerequisites
Ensure you have **Node.js** (v20.0.0 or higher) and **npm** installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/ImranVibes/Chat-ID-Finder-Bot.git
cd Chat-ID-Finder-Bot
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Secrets
1. Create a `.env` file in the root directory (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set `BOT_TOKEN` to your actual Bot Token from **@BotFather** on Telegram:
   ```ini
   BOT_TOKEN=your_telegram_bot_token_here
   ```

### 5. Run the Bot
* **Development Mode (Hot-reloading with tsx watch):**
  ```bash
  npm run dev
  ```
* **Production Mode (Compile to JS and start):**
  ```bash
  npm run build
  npm run start
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
