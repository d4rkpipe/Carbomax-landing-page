// Telegram notifier — posts a plain-text message to a chat/group via a bot.
// Configure with env vars:
//   TELEGRAM_BOT_TOKEN  — from @BotFather
//   TELEGRAM_CHAT_ID    — the group/chat id the bot posts to
// If either is missing, sends are skipped (logged) so form submissions still
// save to the DB without the notification.
const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegram(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — notification skipped')
    return { ok: false, skipped: true }
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: true }),
    })
    const data = await res.json().catch(() => ({}))
    if (!data.ok) console.warn('[telegram] send failed:', data.description || res.status)
    return { ok: !!data.ok }
  } catch (e) {
    console.warn('[telegram] error:', e.message)
    return { ok: false }
  }
}
