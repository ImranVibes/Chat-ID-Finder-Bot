import { api, InputFile } from 'sdk';
import { getPayload } from '../lib/cache.js';
import { escapeHTML } from '../lib/formatter.js';

export default async function (callbackQuery, ctx) {
  const data = callbackQuery.data;
  if (!data) return;

  const [action, cacheId] = data.split(':');
  const chatId = callbackQuery.message?.chat?.id;

  if (action === 'fetching_ignore') {
    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
      text: '⏳ Please wait, your request is currently processing!',
      show_alert: false,
    });
    return;
  }

  if (action === 'raw_json') {
    const entry = await getPayload(cacheId);
    if (!entry) {
      await api.answerCallbackQuery({
        callback_query_id: callbackQuery.id,
        text: '⚠️ Cache expired! Inspection details are kept for 24 hours.',
        show_alert: true,
      });
      return;
    }

    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
      text: '⚙️ Compiling raw JSON data...',
    });

    const jsonText = `<pre><code class="language-json">${escapeHTML(entry.json)}</code></pre>`;

    // If json exceeds Telegram message character limit (4096), send as downloadable JSON file
    if (jsonText.length > 4000) {
      const encoder = new TextEncoder();
      const fileBytes = encoder.encode(entry.json);
      await api.sendDocument({
        chat_id: chatId,
        document: new InputFile(fileBytes, 'raw_payload.json', { type: 'application/json' }),
        caption: '⚙️ <b>Raw JSON Payload</b> (Too large for Telegram message limit)',
        parse_mode: 'HTML',
      });
    } else {
      await api.sendMessage({
        chat_id: chatId,
        text: jsonText,
        parse_mode: 'HTML',
      });
    }
    return;
  }

  if (action === 'raw_photo') {
    const entry = await getPayload(cacheId);
    if (!entry || !entry.photoFileId) {
      await api.answerCallbackQuery({
        callback_query_id: callbackQuery.id,
        text: '⚠️ Cache expired or no high-resolution photo available.',
        show_alert: true,
      });
      return;
    }

    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
      text: '📥 Downloading high-resolution photo file...',
    });

    try {
      // Download bytes directly using Telegram Serverless SDK getFileContent
      const bytes = await api.getFileContent(entry.photoFileId);
      await api.sendDocument({
        chat_id: chatId,
        document: new InputFile(bytes, 'profile_photo.jpg', { type: 'image/jpeg' }),
        caption: '📥 <b>High-Resolution Profile Photo</b> (Uncompressed File)',
        parse_mode: 'HTML',
      });
    } catch (dlErr) {
      console.warn('Document download failed, falling back to standard photo transfer:', dlErr);
      await api.sendPhoto({
        chat_id: chatId,
        photo: entry.photoFileId,
        caption: '📥 <b>High-Resolution Profile Photo</b>',
        parse_mode: 'HTML',
      });
    }
    return;
  }

  // Answer any other callback queries cleanly
  await api.answerCallbackQuery({
    callback_query_id: callbackQuery.id,
  });
}
