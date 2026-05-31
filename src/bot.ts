import { Bot, Keyboard, InlineKeyboard, InputFile } from "grammy";
import { config } from "./config.js";
import { botCache } from "./cache.js";
import {
  escapeHTML,
  formatUserProfile,
  formatSharedUser,
  formatSharedBot,
  formatSharedGroup,
  formatSharedChannel,
  formatSticker,
  formatPhoto,
  formatVideo,
  formatAudio,
  formatDocument,
  formatVideoNote
} from "./formatter.js";

// Initialize the Telegram Bot
const bot = new Bot(config.BOT_TOKEN);

// Define a premium custom reply keyboard requesting different Telegram entities.
// Places User at the absolute top-left for quick access.
const keyboard = new Keyboard()
  .add({
    text: "👤 User",
    request_users: {
      request_id: 3,
      user_is_bot: false,
      max_quantity: 1,
      request_name: true,
      request_username: true,
      request_photo: true
    }
  })
  .add({
    text: "🤖 Bot",
    request_users: {
      request_id: 4,
      user_is_bot: true,
      max_quantity: 1,
      request_name: true,
      request_username: true,
      request_photo: true
    }
  })
  .row()
  .add({
    text: "💬 Chat",
    request_chat: {
      request_id: 1,
      chat_is_channel: false,
      request_title: true,
      request_username: true,
      request_photo: true
    }
  })
  .add({
    text: "📢 Channel",
    request_chat: {
      request_id: 2,
      chat_is_channel: true,
      request_title: true,
      request_username: true,
      request_photo: true
    }
  })
  .resized();

/**
 * Creates inline keyboard buttons for JSON viewing and Raw photo downloading
 */
function createDetailsKeyboard(cacheId: string, hasPhoto: boolean): InlineKeyboard {
  const inlineKb = new InlineKeyboard();
  inlineKb.text("⚙️ View Raw JSON", `raw_json:${cacheId}`);
  if (hasPhoto) {
    inlineKb.text("📥 Raw Photo", `raw_photo:${cacheId}`);
  }
  return inlineKb;
}

// Command handler for /start
bot.command("start", async (ctx) => {
  try {
    const user = ctx.from;
    if (!user) return;

    // Fetch the user's latest profile photo
    const photos = await ctx.api.getUserProfilePhotos(user.id, { limit: 1 });
    const profileDetails = formatUserProfile(user);

    let cacheId = "";
    let photoFileId: string | undefined = undefined;

    if (photos && photos.total_count > 0 && photos.photos[0] && photos.photos[0].length > 0) {
      photoFileId = photos.photos[0][photos.photos[0].length - 1].file_id;
    }

    cacheId = botCache.save(user, photoFileId);
    const inlineKb = createDetailsKeyboard(cacheId, !!photoFileId);

    if (photoFileId) {
      await ctx.replyWithPhoto(photoFileId, {
        caption: profileDetails,
        parse_mode: "HTML",
        reply_markup: inlineKb
      });
    } else {
      await ctx.reply(profileDetails, {
        parse_mode: "HTML",
        reply_markup: inlineKb
      });
    }

    // Follow-up message containing the persistent bottom keyboard
    await ctx.reply(
      "👋 <b>Welcome!</b> Use the keyboard buttons below to find IDs, or forward any message here to inspect its origin.",
      {
        parse_mode: "HTML",
        reply_markup: keyboard
      }
    );
  } catch (error) {
    console.error("Error in /start command:", error);
    try {
      const cacheId = botCache.save(ctx.from!);
      await ctx.reply(formatUserProfile(ctx.from!), {
        parse_mode: "HTML",
        reply_markup: createDetailsKeyboard(cacheId, false)
      });
    } catch (innerError) {
      console.error("Start command complete fallback failure:", innerError);
    }
  }
});

// Command handler for /inspect (diagnose groups/channels details)
bot.command("inspect", async (ctx) => {
  try {
    let chatId: number;
    const args = ctx.match?.trim();

    if (args) {
      const parsedId = Number(args);
      if (isNaN(parsedId)) {
        await ctx.reply("⚠️ Invalid Chat ID format. Please provide a valid numeric Chat ID.");
        return;
      }
      chatId = parsedId;
    } else {
      if (ctx.chat.type === "private") {
        await ctx.reply(
          "ℹ️ <b>How to inspect groups/channels:</b>\n\n" +
          "1. Add this bot to your group or channel as an admin.\n" +
          "2. Send the `/inspect` command directly inside that group/channel.\n" +
          "3. Or use `/inspect [chat_id]` here in private chat if the bot is already a member of that group.",
          { parse_mode: "HTML" }
        );
        return;
      }
      chatId = ctx.chat.id;
    }

    // Fetch inspection details
    const chat = await ctx.api.getChat(chatId);
    const memberCount = await ctx.api.getChatMemberCount(chatId).catch(() => "<i>Unavailable</i>");
    const admins = await ctx.api.getChatAdministrators(chatId);

    const formattedAdmins = admins.map((adm, index) => {
      const name = `${escapeHTML(adm.user.first_name)} ${adm.user.last_name ? escapeHTML(adm.user.last_name) : ""}`.trim();
      const statusBadge = adm.status === "creator" ? "👑 Owner" : "🛡️ Admin";
      const usernameText = adm.user.username ? ` (@${escapeHTML(adm.user.username)})` : "";
      return `${index + 1}. <b>${name}</b>${usernameText} - <i>${statusBadge}</i>`;
    }).join("\n");

    const formattedText = [
      "<b>┌────────────────────────┐</b>",
      "<b>  🛡️  CHAT INSPECTION DETAILS</b>",
      "<b>└────────────────────────┘</b>",
      "",
      `<b>• Title:</b> ${escapeHTML(chat.title || "<i>Private Chat/Channel</i>")}`,
      `<b>• Type:</b> <code>${chat.type}</code>`,
      `<b>• Chat ID:</b> <code>${chat.id}</code> <i>(tap to copy)</i>`,
      `<b>• Username:</b> ${chat.username ? `@${escapeHTML(chat.username)}` : "<i>Private</i>"}`,
      `<b>• Members Count:</b> <code>${memberCount}</code>`,
      "",
      "<b>👥 Chat Administrators:</b>",
      formattedAdmins || "<i>None found or unauthorized</i>"
    ].join("\n");

    const cacheId = botCache.save({ chat, memberCount, admins });
    await ctx.reply(formattedText, {
      parse_mode: "HTML",
      reply_markup: createDetailsKeyboard(cacheId, false)
    });
  } catch (error: any) {
    console.error("Error inspecting chat:", error);
    await ctx.reply(
      `❌ <b>Inspection Failed</b>\n\n` +
      `Ensure the Chat ID is correct, the bot is added to that chat as an administrator, and has permissions to see chat members.\n\n` +
      `<i>Error: ${escapeHTML(error.message || String(error))}</i>`,
      { parse_mode: "HTML" }
    );
  }
});

// Command handler for /help
bot.command("help", async (ctx) => {
  const helpText = [
    "<b>🔍 PREMIUM TELEGRAM CHAT ID FINDER BOT</b>",
    "",
    "This bot helps you quickly find Telegram IDs, usernames, and detailed metadata for yourself, other users, bots, groups, channels, stickers, and media.",
    "",
    "<b>🛠️ AVAILABLE BOT COMMANDS</b>",
    "• /start - View your own profile details and active keyboard.",
    "• /help - Display this professional usage guide.",
    "• <code>/inspect [chat_id]</code> - Inspect group/channel metadata and administrator lists.",
    "",
    "<b>📱 HOW THE BOT WORKS</b>",
    "1. <b>Direct Shares:</b> Use the reply keyboard buttons below to natively share any User, Bot, Group, or Channel. The bot instantly resolves and formats their ID.",
    "2. <b>Forwarded Messages:</b> Forward any text, link, or media from a chat or user to find their ID (even works for hidden users!).",
    "3. <b>Media Metadata Analyzer:</b> Send any direct Photo, Video, Sticker, GIF, Audio, Voice, or Document to inspect raw files and system IDs.",
    "4. <b>JSON & File Exporter:</b> Use the inline buttons under results to view the raw JSON payload or download high-resolution avatar photos.",
    "",
    "<b>👨‍💻 DEVELOPMENT & CREDITS</b>",
    '• <b>Bot Created By:</b> <a href="https://t.me/BangaBandhuSheikhMujiburRahman">@MrBongoBoltu</a>',
    '• <b>Open Source Code:</b> <a href="https://github.com/ImranVibes/Chat-ID-Finder-Bot">GitHub Repository</a>',
    "",
    "<i>All IDs are displayed as monospaced text—simply tap or click them to copy to clipboard instantly!</i>"
  ].join("\n");

  const inlineKb = new InlineKeyboard()
    .url("🐙 GitHub Repository", "https://github.com/ImranVibes/Chat-ID-Finder-Bot")
    .url("👤 Creator Profile", "https://t.me/BangaBandhuSheikhMujiburRahman");

  await ctx.reply(helpText, {
    parse_mode: "HTML",
    reply_markup: inlineKb
  });
});

// Handle shared users and bots
bot.on("message:users_shared", async (ctx) => {
  try {
    const shared = ctx.message.users_shared;
    const isBot = shared.request_id === 4;

    const user = shared.users[0];
    if (!user) {
      await ctx.reply("⚠️ No user details were shared.", { reply_markup: keyboard });
      return;
    }

    const formattedText = isBot ? formatSharedBot(user) : formatSharedUser(user);

    let photoFileId: string | undefined = undefined;
    if (user.photo && user.photo.length > 0) {
      photoFileId = user.photo[user.photo.length - 1].file_id;
    }

    const cacheId = botCache.save(user, photoFileId);
    const inlineKb = createDetailsKeyboard(cacheId, !!photoFileId);

    if (photoFileId) {
      await ctx.replyWithPhoto(photoFileId, {
        caption: formattedText,
        parse_mode: "HTML",
        reply_markup: inlineKb
      });
    } else {
      await ctx.reply(formattedText, {
        parse_mode: "HTML",
        reply_markup: inlineKb
      });
    }
  } catch (error) {
    console.error("Error handling users_shared:", error);
    await ctx.reply("⚠️ Failed to process shared user details.", { reply_markup: keyboard });
  }
});

// Handle shared chats, groups, and channels
bot.on("message:chat_shared", async (ctx) => {
  try {
    const shared = ctx.message.chat_shared;
    const isChannel = shared.request_id === 2;
    const formattedText = isChannel ? formatSharedChannel(shared) : formatSharedGroup(shared);

    let photoFileId: string | undefined = undefined;
    if (shared.photo && shared.photo.length > 0) {
      photoFileId = shared.photo[shared.photo.length - 1].file_id;
    }

    const cacheId = botCache.save(shared, photoFileId);
    const inlineKb = createDetailsKeyboard(cacheId, !!photoFileId);

    if (photoFileId) {
      await ctx.replyWithPhoto(photoFileId, {
        caption: formattedText,
        parse_mode: "HTML",
        reply_markup: inlineKb
      });
    } else {
      await ctx.reply(formattedText, {
        parse_mode: "HTML",
        reply_markup: inlineKb
      });
    }
  } catch (error) {
    console.error("Error handling chat_shared:", error);
    await ctx.reply("⚠️ Failed to process shared chat details.", { reply_markup: keyboard });
  }
});

// Active locks to prevent double-clicks and concurrent processing
const processingLocks = new Set<string>();

// Handle ignore clicks on loading buttons
bot.callbackQuery("fetching_ignore", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "⏳ Please wait, your request is currently processing!",
    show_alert: false
  });
});

// Handle callback queries for inline keyboards (View Raw JSON & Raw Photo Download)
bot.on("callback_query:data", async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;
    const [action, cacheId] = data.split(":");

    if (action === "raw_json") {
      const lockKey = `${ctx.chat?.id}:${ctx.callbackQuery.message?.message_id}:raw_json`;
      if (processingLocks.has(lockKey)) {
        await ctx.answerCallbackQuery({
          text: "⏳ Still exporting the JSON payload, please wait...",
          show_alert: false
        });
        return;
      }

      const entry = botCache.get(cacheId);
      if (!entry) {
        await ctx.answerCallbackQuery({
          text: "⚠️ Cache expired! Details are only kept for 1 hour.",
          show_alert: true
        });
        return;
      }

      processingLocks.add(lockKey);
      await ctx.answerCallbackQuery({
        text: "⚙️ Compiling raw JSON data..."
      });

      const hasPhoto = !!entry.photoFileId;
      // Show temporary loading keyboard state
      const tempKb = new InlineKeyboard()
        .text("⏳ Fetching JSON...", "fetching_ignore");
      if (hasPhoto) {
        tempKb.text("📥 Raw Photo", `raw_photo:${cacheId}`);
      }
      await ctx.editMessageReplyMarkup({ reply_markup: tempKb }).catch(() => {});

      try {
        const jsonText = `<pre><code class="language-json">${escapeHTML(entry.json)}</code></pre>`;
        if (jsonText.length > 4000) {
          const buffer = Buffer.from(entry.json, "utf-8");
          await ctx.replyWithDocument(
            new InputFile(buffer, "raw_payload.json"),
            { caption: "⚙️ <b>Raw JSON Payload</b> (Too large for Telegram message limit)", parse_mode: "HTML" }
          );
        } else {
          await ctx.reply(jsonText, { parse_mode: "HTML" });
        }
      } finally {
        processingLocks.delete(lockKey);
        // Restore original keyboard button state
        const originalKb = createDetailsKeyboard(cacheId, hasPhoto);
        await ctx.editMessageReplyMarkup({ reply_markup: originalKb }).catch(() => {});
      }
    } else if (action === "raw_photo") {
      const lockKey = `${ctx.chat?.id}:${ctx.callbackQuery.message?.message_id}:raw_photo`;
      if (processingLocks.has(lockKey)) {
        await ctx.answerCallbackQuery({
          text: "⏳ Still downloading the photo, please wait...",
          show_alert: false
        });
        return;
      }

      const entry = botCache.get(cacheId);
      if (!entry || !entry.photoFileId) {
        await ctx.answerCallbackQuery({
          text: "⚠️ Cache expired or no high-resolution photo available.",
          show_alert: true
        });
        return;
      }

      processingLocks.add(lockKey);
      await ctx.answerCallbackQuery({
        text: "📥 Downloading high-resolution photo file from servers..."
      });

      // Show temporary loading keyboard state
      const tempKb = new InlineKeyboard()
        .text("⚙️ View Raw JSON", `raw_json:${cacheId}`)
        .text("⏳ Fetching raw photo...", "fetching_ignore");
      await ctx.editMessageReplyMarkup({ reply_markup: tempKb }).catch(() => {});

      try {
        // Resolve the download URL path from Telegram API
        const file = await ctx.api.getFile(entry.photoFileId);
        const filePath = file.file_path;
        if (!filePath) throw new Error("Empty file path returned from Telegram");

        // Download the raw image binary into memory
        const downloadUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${filePath}`;
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Failed to download image file");

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload and send as a fresh, uncompressed document file
        await ctx.replyWithDocument(
          new InputFile(buffer, "profile_photo.jpg"),
          {
            caption: "📥 <b>High-Resolution Profile Photo</b> (Uncompressed File)",
            parse_mode: "HTML"
          }
        );
      } catch (dlError) {
        console.error("Failed to download and send photo as document, falling back to photo transfer:", dlError);
        // Fallback: send as standard photo if document server transfer fails
        await ctx.replyWithPhoto(entry.photoFileId, {
          caption: "📥 <b>High-Resolution Profile Photo</b>\n\n<i>⚠️ Note: Could not render as uncompressed document, sent as standard photo instead.</i>",
          parse_mode: "HTML"
        });
      } finally {
        processingLocks.delete(lockKey);
        // Restore original keyboard button state
        const originalKb = createDetailsKeyboard(cacheId, true);
        await ctx.editMessageReplyMarkup({ reply_markup: originalKb }).catch(() => {});
      }
    }
  } catch (error) {
    console.error("Error in callback query:", error);
    await ctx.answerCallbackQuery({
      text: "⚠️ Error processing request.",
      show_alert: true
    }).catch(() => {});
  }
});

// Handle forwarded messages (must intercept before direct media analyzers)
bot.on("message", async (ctx, next) => {
  if (ctx.message?.forward_origin) {
    try {
      const origin = ctx.message.forward_origin;
      let formattedText = "";

      if (origin.type === "user") {
        formattedText = [
          "<b>┌────────────────────────┐</b>",
          "<b>  ➡️  FORWARDED FROM USER</b>",
          "<b>└────────────────────────┘</b>",
          "",
          `<b>• Name:</b> ${escapeHTML(origin.sender_user.first_name)} ${origin.sender_user.last_name ? escapeHTML(origin.sender_user.last_name) : ""}`.trim(),
          `<b>• Username:</b> ${origin.sender_user.username ? `@${escapeHTML(origin.sender_user.username)}` : "<i>None</i>"}`,
          `<b>• User ID:</b> <code>${origin.sender_user.id}</code> <i>(tap to copy)</i>`,
          `<b>• Account Type:</b> ${origin.sender_user.is_premium ? "🌟 Premium User" : "👤 Standard User"}`,
          "",
          `🔗 <b>Direct Link:</b> <a href="tg://user?id=${origin.sender_user.id}">Open Profile Chat</a>`
        ].join("\n");
      } else if (origin.type === "hidden_user") {
        formattedText = [
          "<b>┌────────────────────────┐</b>",
          "<b>  🔒  FORWARDED (PRIVACY ON)</b>",
          "<b>└────────────────────────┘</b>",
          "",
          `<b>• Name:</b> ${escapeHTML(origin.sender_user_name)}`,
          "<b>• User ID:</b> <i>Hidden due to sender's privacy settings</i>"
        ].join("\n");
      } else if (origin.type === "chat") {
        formattedText = [
          "<b>┌────────────────────────┐</b>",
          "<b>  ➡️  FORWARDED FROM CHAT</b>",
          "<b>└────────────────────────┘</b>",
          "",
          `<b>• Chat Title:</b> ${escapeHTML(origin.sender_chat.title)}`,
          `<b>• Username:</b> ${origin.sender_chat.username ? `@${escapeHTML(origin.sender_chat.username)}` : "<i>Private Chat</i>"}`,
          `<b>• Chat ID:</b> <code>${origin.sender_chat.id}</code> <i>(tap to copy)</i>`
        ].join("\n");
      } else if (origin.type === "channel") {
        formattedText = [
          "<b>┌────────────────────────┐</b>",
          "<b>  ➡️  FORWARDED FROM CHANNEL</b>",
          "<b>└────────────────────────┘</b>",
          "",
          `<b>• Channel Title:</b> ${escapeHTML(origin.chat.title)}`,
          `<b>• Username:</b> ${origin.chat.username ? `@${escapeHTML(origin.chat.username)}` : "<i>Private Channel</i>"}`,
          `<b>• Channel ID:</b> <code>${origin.chat.id}</code> <i>(tap to copy)</i>`,
          `<b>• Original Message ID:</b> <code>${origin.message_id}</code>`
        ].join("\n");
      }

      const cacheId = botCache.save(origin);
      await ctx.reply(formattedText, {
        parse_mode: "HTML",
        reply_markup: createDetailsKeyboard(cacheId, false)
      });
      return;
    } catch (error) {
      console.error("Error processing forwarded message:", error);
      await ctx.reply("⚠️ Failed to parse forwarded message details.", { reply_markup: keyboard });
      return;
    }
  }

  await next();
});

// Handle Media Metadata Analyzer inputs (Photos, Videos, Stickers, GIFs, Audios, Docs, etc.)
bot.on([
  "message:sticker",
  "message:photo",
  "message:video",
  "message:audio",
  "message:voice",
  "message:document",
  "message:video_note",
  "message:animation"
], async (ctx) => {
  try {
    const msg = ctx.message;
    let formattedText = "";
    let cacheId = "";
    let photoFileId: string | undefined = undefined;

    if (msg.sticker) {
      formattedText = formatSticker(msg.sticker);
      cacheId = botCache.save(msg.sticker);
    } else if (msg.photo) {
      formattedText = formatPhoto(msg.photo);
      photoFileId = msg.photo[msg.photo.length - 1].file_id;
      cacheId = botCache.save(msg.photo, photoFileId);
    } else if (msg.video) {
      formattedText = formatVideo(msg.video, false);
      cacheId = botCache.save(msg.video);
    } else if (msg.animation) {
      formattedText = formatVideo(msg.animation, true);
      cacheId = botCache.save(msg.animation);
    } else if (msg.audio) {
      formattedText = formatAudio(msg.audio, false);
      cacheId = botCache.save(msg.audio);
    } else if (msg.voice) {
      formattedText = formatAudio(msg.voice, true);
      cacheId = botCache.save(msg.voice);
    } else if (msg.document) {
      formattedText = formatDocument(msg.document);
      cacheId = botCache.save(msg.document);
    } else if (msg.video_note) {
      formattedText = formatVideoNote(msg.video_note);
      cacheId = botCache.save(msg.video_note);
    }

    await ctx.reply(formattedText, {
      parse_mode: "HTML",
      reply_markup: createDetailsKeyboard(cacheId, !!photoFileId)
    });
  } catch (error) {
    console.error("Error analyzing media metadata:", error);
    await ctx.reply("⚠️ Failed to parse media metadata details.");
  }
});

// Fallback message handler for standard messages
bot.on("message", async (ctx) => {
  await ctx.reply(
    "👋 <b>Welcome to the ID Finder Bot!</b>\n\n" +
    "• Tap one of the buttons below to share a user, bot, group, or channel and instantly find its details.\n" +
    "• Send/forward <b>any Sticker, Photo, Video, GIF, Audio, Document</b> to inspect its metadata.\n" +
    "• Or <b>forward any standard message here</b> to detect its original sender's ID!",
    {
      parse_mode: "HTML",
      reply_markup: keyboard
    }
  );
});

// Global error handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  console.error(err.error);

  ctx.reply("⚠️ <b>An error occurred while processing your request.</b>", {
    parse_mode: "HTML",
    reply_markup: keyboard
  }).catch(() => {});
});

// Start the bot using Long Polling
console.log("🚀 Premium Chat ID Finder Bot starting up...");
bot.start();
