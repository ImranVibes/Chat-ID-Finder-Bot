/**
 * Helper function to escape HTML special characters to prevent Bot API rendering errors.
 */
export function escapeHTML(text: string | undefined | null): string {
  if (!text) return "<i>None</i>";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Formats details of the user running the bot.
 */
export function formatUserProfile(user: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}): string {
  const firstName = escapeHTML(user.first_name);
  const lastName = user.last_name ? escapeHTML(user.last_name) : "";
  const fullName = `${firstName} ${lastName}`.trim();
  const username = user.username ? `@${escapeHTML(user.username)}` : "<i>None</i>";
  const language = user.language_code ? `<code>${escapeHTML(user.language_code)}</code>` : "<i>Unknown</i>";
  const premium = user.is_premium ? "🌟 <b>Premium User</b>" : "👤 <b>Standard User</b>";
  
  const directLink = user.username 
    ? `<a href="https://t.me/${user.username}">Open Profile Chat</a>` 
    : `<a href="tg://user?id=${user.id}">${fullName}</a>`;

  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  👤  YOUR PROFILE DETAILS</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• First Name:</b> ${firstName}`,
    `<b>• Last Name:</b> ${lastName || "<i>None</i>"}`,
    `<b>• Username:</b> ${username}`,
    `<b>• User ID:</b> <code>${user.id}</code> <i>(tap to copy)</i>`,
    `<b>• Language:</b> ${language}`,
    `<b>• Account Type:</b> ${premium}`,
    "",
    `🔗 <b>Direct Link:</b> ${directLink}`
  ].join("\n");
}

/**
 * Formats details of a shared user.
 */
export function formatSharedUser(shared: {
  user_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}): string {
  const firstName = shared.first_name ? escapeHTML(shared.first_name) : "<i>Hidden/Unavailable</i>";
  const lastName = shared.last_name ? escapeHTML(shared.last_name) : "";
  const fullName = `${firstName} ${lastName}`.trim();
  const username = shared.username ? `@${escapeHTML(shared.username)}` : "<i>None</i>";

  const directLink = shared.username 
    ? `<a href="https://t.me/${shared.username}">Open Profile Chat</a>` 
    : `<a href="tg://user?id=${shared.user_id}">${fullName}</a>`;

  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  👥  SHARED USER DETAILS</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• Full Name:</b> ${fullName}`,
    `<b>• Username:</b> ${username}`,
    `<b>• User ID:</b> <code>${shared.user_id}</code> <i>(tap to copy)</i>`,
    "",
    `🔗 <b>Direct Link:</b> ${directLink}`
  ].join("\n");
}

/**
 * Formats details of a shared bot.
 */
export function formatSharedBot(shared: {
  user_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}): string {
  const firstName = shared.first_name ? escapeHTML(shared.first_name) : "<i>Hidden/Unavailable</i>";
  const lastName = shared.last_name ? escapeHTML(shared.last_name) : "";
  const fullName = `${firstName} ${lastName}`.trim();
  const username = shared.username ? `@${escapeHTML(shared.username)}` : "<i>None</i>";

  const directLink = shared.username 
    ? `<a href="https://t.me/${shared.username}">Open Bot Chat</a>` 
    : `<a href="tg://user?id=${shared.user_id}">${fullName}</a>`;

  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  🤖  SHARED BOT DETAILS</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• Bot Name:</b> ${fullName}`,
    `<b>• Username:</b> ${username}`,
    `<b>• Bot ID:</b> <code>${shared.user_id}</code> <i>(tap to copy)</i>`,
    "",
    `🔗 <b>Direct Link:</b> ${directLink}`
  ].join("\n");
}

/**
 * Formats details of a shared group/chat.
 */
export function formatSharedGroup(shared: {
  chat_id: number;
  title?: string;
  username?: string;
}): string {
  const title = shared.title ? escapeHTML(shared.title) : "<i>Hidden/Unavailable</i>";
  const username = shared.username ? `@${escapeHTML(shared.username)}` : "<i>Private Group</i>";

  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  💬  SHARED GROUP DETAILS</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• Group Title:</b> ${title}`,
    `<b>• Username:</b> ${username}`,
    `<b>• Group ID:</b> <code>${shared.chat_id}</code> <i>(tap to copy)</i>`,
  ].join("\n");
}

/**
 * Formats details of a shared channel.
 */
export function formatSharedChannel(shared: {
  chat_id: number;
  title?: string;
  username?: string;
}): string {
  const title = shared.title ? escapeHTML(shared.title) : "<i>Hidden/Unavailable</i>";
  const username = shared.username ? `@${escapeHTML(shared.username)}` : "<i>Private Channel</i>";

  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  📢  SHARED CHANNEL DETAILS</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• Channel Title:</b> ${title}`,
    `<b>• Username:</b> ${username}`,
    `<b>• Channel ID:</b> <code>${shared.chat_id}</code> <i>(tap to copy)</i>`,
  ].join("\n");
}

/**
 * Format bytes into human readable file size
 */
export function formatBytes(bytes?: number): string {
  if (!bytes) return "<i>Unknown</i>";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Formats Sticker and Custom Emoji metadata
 */
export function formatSticker(sticker: any): string {
  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  🎨  STICKER / EMOJI METADATA</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• Sticker Emoji:</b> ${sticker.emoji || "<i>None</i>"}`,
    `<b>• Sticker Set Name:</b> ${sticker.set_name ? `<code>${escapeHTML(sticker.set_name)}</code>` : "<i>None (Single Sticker)</i>"}`,
    `<b>• Dimensions:</b> <code>${sticker.width} x ${sticker.height} px</code>`,
    `<b>• Animated:</b> ${sticker.is_animated ? "Yes 🎬" : "No 🖼️"}`,
    `<b>• Video Sticker:</b> ${sticker.is_video ? "Yes 📹" : "No"}`,
    `<b>• File Size:</b> <code>${formatBytes(sticker.file_size)}</code>`,
    `<b>• File ID:</b> <code>${sticker.file_id}</code>`
  ].join("\n");
}

/**
 * Formats Photo metadata
 */
export function formatPhoto(photo: any): string {
  const highest = photo[photo.length - 1];
  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  🖼️  PHOTO METADATA</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• High-Res Dimensions:</b> <code>${highest.width} x ${highest.height} px</code>`,
    `<b>• File Size:</b> <code>${formatBytes(highest.file_size)}</code>`,
    `<b>• File ID:</b> <code>${highest.file_id}</code>`
  ].join("\n");
}

/**
 * Formats Video/Animation metadata
 */
export function formatVideo(video: any, isAnimation = false): string {
  return [
    "<b>┌────────────────────────┐</b>",
    `<b>  ${isAnimation ? "🎬  ANIMATION (GIF)" : "📹  VIDEO"} METADATA</b>`,
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• File Name:</b> ${video.file_name ? escapeHTML(video.file_name) : "<i>None</i>"}`,
    `<b>• Mime Type:</b> <code>${video.mime_type || "<i>Unknown</i>"}</code>`,
    `<b>• Dimensions:</b> <code>${video.width} x ${video.height} px</code>`,
    `<b>• Duration:</b> <code>${video.duration} seconds</code>`,
    `<b>• File Size:</b> <code>${formatBytes(video.file_size)}</code>`,
    `<b>• File ID:</b> <code>${video.file_id}</code>`
  ].join("\n");
}

/**
 * Formats Audio/Voice metadata
 */
export function formatAudio(audio: any, isVoice = false): string {
  return [
    "<b>┌────────────────────────┐</b>",
    `<b>  ${isVoice ? "🎙️  VOICE NOTE" : "🎵  AUDIO"} METADATA</b>`,
    "<b>└────────────────────────┘</b>",
    "",
    isVoice ? "" : `<b>• Title:</b> ${audio.title ? escapeHTML(audio.title) : "<i>None</i>"}`,
    isVoice ? "" : `<b>• Performer:</b> ${audio.performer ? escapeHTML(audio.performer) : "<i>None</i>"}`,
    `<b>• Mime Type:</b> <code>${audio.mime_type || "<i>Unknown</i>"}</code>`,
    `<b>• Duration:</b> <code>${audio.duration} seconds</code>`,
    `<b>• File Size:</b> <code>${formatBytes(audio.file_size)}</code>`,
    `<b>• File ID:</b> <code>${audio.file_id}</code>`
  ].join("\n").replace(/\n+/g, "\n").trim();
}

/**
 * Formats Document metadata
 */
export function formatDocument(doc: any): string {
  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  📄  DOCUMENT METADATA</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• File Name:</b> <code>${doc.file_name ? escapeHTML(doc.file_name) : "<i>None</i>"}</code>`,
    `<b>• Mime Type:</b> <code>${doc.mime_type || "<i>Unknown</i>"}</code>`,
    `<b>• File Size:</b> <code>${formatBytes(doc.file_size)}</code>`,
    `<b>• File ID:</b> <code>${doc.file_id}</code>`
  ].join("\n");
}

/**
 * Formats Video Note metadata
 */
export function formatVideoNote(note: any): string {
  return [
    "<b>┌────────────────────────┐</b>",
    "<b>  ⭕  VIDEO NOTE METADATA</b>",
    "<b>└────────────────────────┘</b>",
    "",
    `<b>• Dimensions:</b> <code>${note.length} x ${note.length} px</code>`,
    `<b>• Duration:</b> <code>${note.duration} seconds</code>`,
    `<b>• File Size:</b> <code>${formatBytes(note.file_size)}</code>`,
    `<b>• File ID:</b> <code>${note.file_id}</code>`
  ].join("\n");
}
