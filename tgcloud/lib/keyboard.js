/**
 * Returns the Telegram custom reply keyboard with user, bot, group, and channel sharing buttons.
 */
export function getReplyKeyboard() {
  return {
    keyboard: [
      [
        {
          text: '👤 User',
          request_users: {
            request_id: 3,
            user_is_bot: false,
            max_quantity: 1,
            request_name: true,
            request_username: true,
            request_photo: true,
          },
        },
        {
          text: '🤖 Bot',
          request_users: {
            request_id: 4,
            user_is_bot: true,
            max_quantity: 1,
            request_name: true,
            request_username: true,
            request_photo: true,
          },
        },
      ],
      [
        {
          text: '💬 Chat',
          request_chat: {
            request_id: 1,
            chat_is_channel: false,
            request_title: true,
            request_username: true,
            request_photo: true,
          },
        },
        {
          text: '📢 Channel',
          request_chat: {
            request_id: 2,
            chat_is_channel: true,
            request_title: true,
            request_username: true,
            request_photo: true,
          },
        },
      ],
    ],
    resize_keyboard: true,
  };
}

/**
 * Creates inline keyboard buttons for JSON viewing and Raw photo downloading.
 */
export function createDetailsKeyboard(cacheId, hasPhoto = false) {
  const buttons = [
    { text: '⚙️ View Raw JSON', callback_data: `raw_json:${cacheId}` },
  ];
  if (hasPhoto) {
    buttons.push({ text: '📥 Raw Photo', callback_data: `raw_photo:${cacheId}` });
  }
  return {
    inline_keyboard: [buttons],
  };
}

/**
 * Creates inline keyboard buttons for the /help command.
 */
export function createHelpKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🐙 GitHub Repository', url: 'https://github.com/ImranVibes/Chat-ID-Finder-Bot' },
        { text: '👤 Creator Profile', url: 'https://t.me/BangaBandhuSheikhMujiburRahman' },
      ],
    ],
  };
}
