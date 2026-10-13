import messageHandler from './message.js';

/**
 * Handles incoming channel posts (e.g. /inspect commands sent inside a channel
 * where the bot is added as administrator).
 */
export default async function (channelPost, ctx) {
  // Delegate channel post to message handler
  return await messageHandler(channelPost, ctx);
}
