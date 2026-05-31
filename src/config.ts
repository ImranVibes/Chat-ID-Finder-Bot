import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export interface Config {
  BOT_TOKEN: string;
}

function loadConfig(): Config {
  const token = process.env.BOT_TOKEN;

  if (!token || token === "YOUR_TELEGRAM_BOT_TOKEN_HERE" || token.trim() === "") {
    throw new Error(
      "CRITICAL: BOT_TOKEN is missing or not set in the .env file! " +
      "Please open the .env file and set BOT_TOKEN to your actual Telegram Bot Token from @BotFather."
    );
  }

  return {
    BOT_TOKEN: token.trim(),
  };
}

export const config = loadConfig();
