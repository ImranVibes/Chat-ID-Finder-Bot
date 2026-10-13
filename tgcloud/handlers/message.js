import { api } from 'sdk';
import { savePayload } from '../lib/cache.js';
import { getReplyKeyboard, createDetailsKeyboard, createHelpKeyboard } from '../lib/keyboard.js';
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
  formatVideoNote,
} from '../lib/formatter.js';

export default async function (message, ctx) {
  const chatId = message.chat.id;
  const text = message.text ? message.text.trim() : '';

  // 1. Handle /start command
  if (text.startsWith('/start')) {
    try {
      const user = message.from;
      if (!user) return;

      let photoFileId = null;
      try {
        const photos = await api.getUserProfilePhotos({ user_id: user.id, limit: 1 });
        if (photos && photos.total_count > 0 && photos.photos[0] && photos.photos[0].length > 0) {
          photoFileId = photos.photos[0][photos.photos[0].length - 1].file_id;
        }
      } catch (photoErr) {
        console.warn('Could not fetch user profile photo:', photoErr);
      }

      const profileDetails = formatUserProfile(user);
      const cacheId = await savePayload(user, photoFileId);
      const detailsKb = createDetailsKeyboard(cacheId, !!photoFileId);

      if (photoFileId) {
        await api.sendPhoto({
          chat_id: chatId,
          photo: photoFileId,
          caption: profileDetails,
          parse_mode: 'HTML',
          reply_markup: detailsKb,
        });
      } else {
        await api.sendMessage({
          chat_id: chatId,
          text: profileDetails,
          parse_mode: 'HTML',
          reply_markup: detailsKb,
        });
      }

      // Send follow-up welcome message with persistent keyboard
      await api.sendMessage({
        chat_id: chatId,
        text:
          '👋 <b>Welcome!</b> Use the keyboard buttons below to find IDs, or forward any message here to inspect its origin.\n\n' +
          '❓ <b>Need help?</b> Click /help to see all features and bot commands!',
        parse_mode: 'HTML',
        reply_markup: getReplyKeyboard(),
      });
      return;
    } catch (err) {
      console.error('Error in /start command:', err);
      if (message.from) {
        const cacheId = await savePayload(message.from);
        await api.sendMessage({
          chat_id: chatId,
          text: formatUserProfile(message.from),
          parse_mode: 'HTML',
          reply_markup: createDetailsKeyboard(cacheId, false),
        });
      }
      return;
    }
  }

  // 2. Handle /help command
  if (text.startsWith('/help')) {
    const helpText = [
      '<b>🔍 PREMIUM TELEGRAM CHAT ID FINDER BOT</b>',
      '',
      'This bot helps you quickly find Telegram IDs, usernames, and detailed metadata for yourself, other users, bots, groups, channels, stickers, and media.',
      '',
      '<b>🛠️ AVAILABLE BOT COMMANDS</b>',
      '• /start - View your own profile details and active keyboard.',
      '• /help - Display this professional usage guide.',
      '• <code>/inspect [chat_id]</code> - Inspect group/channel metadata and administrator lists.',
      '',
      '<b>📱 HOW THE BOT WORKS</b>',
      '1. <b>Direct Shares:</b> Use the reply keyboard buttons below to natively share any User, Bot, Group, or Channel. The bot instantly resolves and formats their ID.',
      '2. <b>Forwarded Messages:</b> Forward any text, link, or media from a chat or user to find their ID (even works for hidden users!).',
      '3. <b>Media Metadata Analyzer:</b> Send any direct Photo, Video, Sticker, GIF, Audio, Voice, or Document to inspect raw files and system IDs.',
      '4. <b>JSON & File Exporter:</b> Use the inline buttons under results to view the raw JSON payload or download high-resolution avatar photos.',
      '',
      '<b>👨‍💻 DEVELOPMENT & CREDITS</b>',
      '• <b>Bot Created By:</b> <a href="https://t.me/BangaBandhuSheikhMujiburRahman">@MrBongoBoltu</a>',
      '• <b>Open Source Code:</b> <a href="https://github.com/ImranVibes/Chat-ID-Finder-Bot">GitHub Repository</a>',
      '',
      '<i>All IDs are displayed as monospaced text—simply tap or click them to copy to clipboard instantly!</i>',
    ].join('\n');

    await api.sendMessage({
      chat_id: chatId,
      text: helpText,
      parse_mode: 'HTML',
      reply_markup: createHelpKeyboard(),
    });
    return;
  }

  // 3. Handle /inspect command
  if (text.startsWith('/inspect')) {
    try {
      const matchArg = text.replace(/^\/inspect(@\w+)?\s*/, '').trim();
      let targetChatId;

      if (matchArg) {
        const parsedId = Number(matchArg);
        if (isNaN(parsedId)) {
          await api.sendMessage({
            chat_id: chatId,
            text: '⚠️ Invalid Chat ID format. Please provide a valid numeric Chat ID.',
          });
          return;
        }
        targetChatId = parsedId;
      } else {
        if (message.chat.type === 'private') {
          await api.sendMessage({
            chat_id: chatId,
            text:
              'ℹ️ <b>How to inspect groups/channels:</b>\n\n' +
              '1. Add this bot to your group or channel as an admin.\n' +
              '2. Send the <code>/inspect</code> command directly inside that group/channel.\n' +
              '3. Or use <code>/inspect [chat_id]</code> here in private chat if the bot is already a member of that group.',
            parse_mode: 'HTML',
          });
          return;
        }
        targetChatId = chatId;
      }

      const chat = await api.getChat({ chat_id: targetChatId });
      let memberCount = '<i>Unavailable</i>';
      try {
        const count = await api.getChatMemberCount({ chat_id: targetChatId });
        memberCount = String(count);
      } catch (cntErr) {
        // Ignored, fallback stays Unavailable
      }

      let admins = [];
      try {
        admins = await api.getChatAdministrators({ chat_id: targetChatId });
      } catch (admErr) {
        // Ignored, empty list
      }

      const formattedAdmins = admins
        .map((adm, index) => {
          const name = `${escapeHTML(adm.user.first_name)} ${adm.user.last_name ? escapeHTML(adm.user.last_name) : ''}`.trim();
          const statusBadge = adm.status === 'creator' ? '👑 Owner' : '🛡️ Admin';
          const usernameText = adm.user.username ? ` (@${escapeHTML(adm.user.username)})` : '';
          return `${index + 1}. <b>${name}</b>${usernameText} - <i>${statusBadge}</i>`;
        })
        .join('\n');

      const formattedText = [
        '<b>┌────────────────────────┐</b>',
        '<b>  🛡️  CHAT INSPECTION DETAILS</b>',
        '<b>└────────────────────────┘</b>',
        '',
        `<b>• Title:</b> ${escapeHTML(chat.title || '<i>Private Chat/Channel</i>')}`,
        `<b>• Type:</b> <code>${chat.type}</code>`,
        `<b>• Chat ID:</b> <code>${chat.id}</code> <i>(tap to copy)</i>`,
        `<b>• Username:</b> ${chat.username ? `@${escapeHTML(chat.username)}` : '<i>Private</i>'}`,
        `<b>• Members Count:</b> <code>${memberCount}</code>`,
        '',
        '<b>👥 Chat Administrators:</b>',
        formattedAdmins || '<i>None found or unauthorized</i>',
      ].join('\n');

      const cacheId = await savePayload({ chat, memberCount, admins });
      await api.sendMessage({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
        reply_markup: createDetailsKeyboard(cacheId, false),
      });
      return;
    } catch (inspectErr) {
      console.error('Error inspecting chat:', inspectErr);
      await api.sendMessage({
        chat_id: chatId,
        text:
          '❌ <b>Inspection Failed</b>\n\n' +
          'Ensure the Chat ID is correct, the bot is added to that chat as an administrator, and has permissions to see chat members.\n\n' +
          `<i>Error: ${escapeHTML(inspectErr.description || inspectErr.message || String(inspectErr))}</i>`,
        parse_mode: 'HTML',
      });
      return;
    }
  }

  // 4. Handle shared users and bots
  if (message.users_shared) {
    try {
      const shared = message.users_shared;
      const isBot = shared.request_id === 4;
      const user = shared.users && shared.users[0];

      if (!user) {
        await api.sendMessage({
          chat_id: chatId,
          text: '⚠️ No user details were shared.',
          reply_markup: getReplyKeyboard(),
        });
        return;
      }

      const formattedText = isBot ? formatSharedBot(user) : formatSharedUser(user);
      let photoFileId = null;
      if (user.photo && user.photo.length > 0) {
        photoFileId = user.photo[user.photo.length - 1].file_id;
      }

      const cacheId = await savePayload(user, photoFileId);
      const detailsKb = createDetailsKeyboard(cacheId, !!photoFileId);

      if (photoFileId) {
        await api.sendPhoto({
          chat_id: chatId,
          photo: photoFileId,
          caption: formattedText,
          parse_mode: 'HTML',
          reply_markup: detailsKb,
        });
      } else {
        await api.sendMessage({
          chat_id: chatId,
          text: formattedText,
          parse_mode: 'HTML',
          reply_markup: detailsKb,
        });
      }
      return;
    } catch (err) {
      console.error('Error handling users_shared:', err);
      await api.sendMessage({
        chat_id: chatId,
        text: '⚠️ Failed to process shared user details.',
        reply_markup: getReplyKeyboard(),
      });
      return;
    }
  }

  // 5. Handle shared chats, groups, and channels
  if (message.chat_shared) {
    try {
      const shared = message.chat_shared;
      const isChannel = shared.request_id === 2;
      const formattedText = isChannel ? formatSharedChannel(shared) : formatSharedGroup(shared);

      let photoFileId = null;
      if (shared.photo && shared.photo.length > 0) {
        photoFileId = shared.photo[shared.photo.length - 1].file_id;
      }

      const cacheId = await savePayload(shared, photoFileId);
      const detailsKb = createDetailsKeyboard(cacheId, !!photoFileId);

      if (photoFileId) {
        await api.sendPhoto({
          chat_id: chatId,
          photo: photoFileId,
          caption: formattedText,
          parse_mode: 'HTML',
          reply_markup: detailsKb,
        });
      } else {
        await api.sendMessage({
          chat_id: chatId,
          text: formattedText,
          parse_mode: 'HTML',
          reply_markup: detailsKb,
        });
      }
      return;
    } catch (err) {
      console.error('Error handling chat_shared:', err);
      await api.sendMessage({
        chat_id: chatId,
        text: '⚠️ Failed to process shared chat details.',
        reply_markup: getReplyKeyboard(),
      });
      return;
    }
  }

  // 6. Handle forwarded messages (forward_origin)
  if (message.forward_origin) {
    try {
      const origin = message.forward_origin;
      let formattedText = '';

      if (origin.type === 'user') {
        const firstName = escapeHTML(origin.sender_user.first_name);
        const lastName = origin.sender_user.last_name ? escapeHTML(origin.sender_user.last_name) : '';
        const fullName = `${firstName} ${lastName}`.trim();

        const directLink = origin.sender_user.username
          ? `<a href="https://t.me/${origin.sender_user.username}">Open Profile Chat</a>`
          : `<a href="tg://user?id=${origin.sender_user.id}">${fullName}</a>`;

        formattedText = [
          '<b>┌────────────────────────┐</b>',
          '<b>  ➡️  FORWARDED FROM USER</b>',
          '<b>└────────────────────────┘</b>',
          '',
          `<b>• Name:</b> ${fullName}`,
          `<b>• Username:</b> ${origin.sender_user.username ? `@${escapeHTML(origin.sender_user.username)}` : '<i>None</i>'}`,
          `<b>• User ID:</b> <code>${origin.sender_user.id}</code> <i>(tap to copy)</i>`,
          `<b>• Account Type:</b> ${origin.sender_user.is_premium ? '🌟 Premium User' : '👤 Standard User'}`,
          '',
          `🔗 <b>Direct Link:</b> ${directLink}`,
        ].join('\n');
      } else if (origin.type === 'hidden_user') {
        formattedText = [
          '<b>┌────────────────────────┐</b>',
          '<b>  🔒  FORWARDED (PRIVACY ON)</b>',
          '<b>└────────────────────────┘</b>',
          '',
          `<b>• Name:</b> ${escapeHTML(origin.sender_user_name)}`,
          "<b>• User ID:</b> <i>Hidden due to sender's privacy settings</i>",
        ].join('\n');
      } else if (origin.type === 'chat') {
        formattedText = [
          '<b>┌────────────────────────┐</b>',
          '<b>  ➡️  FORWARDED FROM CHAT</b>',
          '<b>└────────────────────────┘</b>',
          '',
          `<b>• Chat Title:</b> ${escapeHTML(origin.sender_chat.title)}`,
          `<b>• Username:</b> ${origin.sender_chat.username ? `@${escapeHTML(origin.sender_chat.username)}` : '<i>Private Chat</i>'}`,
          `<b>• Chat ID:</b> <code>${origin.sender_chat.id}</code> <i>(tap to copy)</i>`,
        ].join('\n');
      } else if (origin.type === 'channel') {
        formattedText = [
          '<b>┌────────────────────────┐</b>',
          '<b>  ➡️  FORWARDED FROM CHANNEL</b>',
          '<b>└────────────────────────┘</b>',
          '',
          `<b>• Channel Title:</b> ${escapeHTML(origin.chat.title)}`,
          `<b>• Username:</b> ${origin.chat.username ? `@${escapeHTML(origin.chat.username)}` : '<i>Private Channel</i>'}`,
          `<b>• Channel ID:</b> <code>${origin.chat.id}</code> <i>(tap to copy)</i>`,
          `<b>• Original Message ID:</b> <code>${origin.message_id}</code>`,
        ].join('\n');
      }

      const cacheId = await savePayload(origin);
      await api.sendMessage({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
        reply_markup: createDetailsKeyboard(cacheId, false),
      });
      return;
    } catch (err) {
      console.error('Error processing forwarded message:', err);
      await api.sendMessage({
        chat_id: chatId,
        text: '⚠️ Failed to parse forwarded message details.',
        reply_markup: getReplyKeyboard(),
      });
      return;
    }
  }

  // 7. Handle media metadata analyzer inputs
  if (
    message.sticker ||
    message.photo ||
    message.video ||
    message.audio ||
    message.voice ||
    message.document ||
    message.video_note ||
    message.animation
  ) {
    try {
      let formattedText = '';
      let cacheId = '';
      let photoFileId = null;

      if (message.sticker) {
        formattedText = formatSticker(message.sticker);
        cacheId = await savePayload(message.sticker);
      } else if (message.photo) {
        formattedText = formatPhoto(message.photo);
        photoFileId = message.photo[message.photo.length - 1].file_id;
        cacheId = await savePayload(message.photo, photoFileId);
      } else if (message.video) {
        formattedText = formatVideo(message.video, false);
        cacheId = await savePayload(message.video);
      } else if (message.animation) {
        formattedText = formatVideo(message.animation, true);
        cacheId = await savePayload(message.animation);
      } else if (message.audio) {
        formattedText = formatAudio(message.audio, false);
        cacheId = await savePayload(message.audio);
      } else if (message.voice) {
        formattedText = formatAudio(message.voice, true);
        cacheId = await savePayload(message.voice);
      } else if (message.document) {
        formattedText = formatDocument(message.document);
        cacheId = await savePayload(message.document);
      } else if (message.video_note) {
        formattedText = formatVideoNote(message.video_note);
        cacheId = await savePayload(message.video_note);
      }

      await api.sendMessage({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
        reply_markup: createDetailsKeyboard(cacheId, !!photoFileId),
      });
      return;
    } catch (err) {
      console.error('Error analyzing media metadata:', err);
      await api.sendMessage({
        chat_id: chatId,
        text: '⚠️ Failed to parse media metadata details.',
      });
      return;
    }
  }

  // 8. Default fallback for plain messages
  await api.sendMessage({
    chat_id: chatId,
    text:
      '👋 <b>Welcome to the ID Finder Bot!</b>\n\n' +
      '• Tap one of the buttons below to share a user, bot, group, or channel and instantly find its details.\n' +
      '• Send/forward <b>any Sticker, Photo, Video, GIF, Audio, Document</b> to inspect its metadata.\n' +
      '• Or <b>forward any standard message here</b> to detect its original sender\'s ID!\n\n' +
      '❓ <b>Need help?</b> Tap /help to view all features and bot commands!',
    parse_mode: 'HTML',
    reply_markup: getReplyKeyboard(),
  });
}
