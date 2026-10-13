import { buildPushPayload } from "@block65/webcrypto-web-push";

const ISTANBUL_TIMEZONE = "Europe/Istanbul";
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const MAX_REQUEST_BYTES = 512 * 1024;
const BACKUP_ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const BACKUP_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const SECURITY_HEADERS = {
  "cache-control": "no-store",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

async function readJson(request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_REQUEST_BYTES) throw new Error("İstek çok büyük.");
  const text = await request.text();
  if (!text || new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) throw new Error("Geçersiz istek.");
  return JSON.parse(text);
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed.includes(origin) ? origin : "";
}

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,x-backup-token",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

async function endpointId(endpoint) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function reminderMinutes(value, fallback) {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 10080 ? minutes : fallback;
}

function sanitizeSchedule(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    const name = String(item?.name || "").trim().slice(0, 160);
    if (!name) return [];
    if (item?.type === "assignment") {
      const dueAt = new Date(String(item?.dueAt || ""));
      if (Number.isNaN(dueAt.getTime())) return [];
      return [{
        type: "assignment",
        id: String(item?.id || "").trim().slice(0, 100),
        name,
        course: String(item?.course || "").trim().slice(0, 160),
        dueAt: dueAt.toISOString(),
        reminderMinutes: reminderMinutes(item?.reminderMinutes, 1440),
      }];
    }
    const day = Number(item?.day);
    const start = String(item?.start || "");
    if (!Number.isInteger(day) || day < 0 || day > 6 || !validTime(start)) return [];
    return [{
      type: "course",
      day,
      start,
      name,
      code: String(item?.code || "").trim().slice(0, 40),
      room: String(item?.room || "").trim().slice(0, 120),
      reminderMinutes: reminderMinutes(item?.reminderMinutes, 15),
    }];
  });
}

function validateSubscription(value) {
  const endpoint = String(value?.endpoint || "");
  const p256dh = String(value?.keys?.p256dh || "");
  const auth = String(value?.keys?.auth || "");
  let endpointUrl;
  try {
    endpointUrl = new URL(endpoint);
  } catch (_) {
    return null;
  }
  const hostname = endpointUrl.hostname.toLowerCase();
  const keyPattern = /^[A-Za-z0-9_-]+$/;
  const invalidHost = hostname === "localhost"
    || hostname.endsWith(".localhost")
    || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
    || hostname.includes(":");
  if (
    endpointUrl.protocol !== "https:"
    || endpointUrl.username
    || endpointUrl.password
    || (endpointUrl.port && endpointUrl.port !== "443")
    || endpoint.length > 2048
    || invalidHost
    || p256dh.length < 40
    || p256dh.length > 256
    || auth.length < 16
    || auth.length > 128
    || !keyPattern.test(p256dh)
    || !keyPattern.test(auth)
  ) return null;
  return { endpoint, expirationTime: value?.expirationTime || null, keys: { p256dh, auth } };
}

async function saveSubscription(request, env, headers) {
  let body;
  try {
    body = await readJson(request);
  } catch (_) {
    return json({ error: "Geçersiz veya çok büyük istek." }, 400, headers);
  }
  const subscription = validateSubscription(body.subscription);
  const schedule = sanitizeSchedule(body.schedule);
  if (!subscription || !Array.isArray(body.schedule)) {
    return json({ error: "Geçersiz abonelik veya ders programı." }, 400, headers);
  }
  const id = await endpointId(subscription.endpoint);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO subscriptions
      (id, endpoint, p256dh, auth, schedule_json, timezone, enabled, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, ?7, ?7)
    ON CONFLICT(id) DO UPDATE SET
      endpoint = excluded.endpoint,
      p256dh = excluded.p256dh,
      auth = excluded.auth,
      schedule_json = excluded.schedule_json,
      timezone = excluded.timezone,
      enabled = 1,
      updated_at = excluded.updated_at
  `).bind(
    id,
    subscription.endpoint,
    subscription.keys.p256dh,
    subscription.keys.auth,
    JSON.stringify(schedule),
    ISTANBUL_TIMEZONE,
    now,
  ).run();
  return json({ ok: true }, 201, headers);
}

async function removeSubscription(request, env, headers) {
  let body;
  try {
    body = await readJson(request);
  } catch (_) {
    return json({ error: "Geçersiz istek." }, 400, headers);
  }
  const endpoint = String(body.endpoint || "");
  let endpointUrl;
  try {
    endpointUrl = new URL(endpoint);
  } catch (_) {
    return json({ error: "Geçersiz abonelik." }, 400, headers);
  }
  if (endpointUrl.protocol !== "https:" || endpoint.length > 2048) return json({ error: "Geçersiz abonelik." }, 400, headers);
  await env.DB.prepare("DELETE FROM subscriptions WHERE id = ?1")
    .bind(await endpointId(endpoint))
    .run();
  return json({ ok: true }, 200, headers);
}

function backupCredentials(request, url) {
  const match = url.pathname.match(/^\/backups\/([A-Za-z0-9_-]{22})$/);
  const token = request.headers.get("x-backup-token") || "";
  if (!match || !BACKUP_ID_PATTERN.test(match[1]) || !BACKUP_TOKEN_PATTERN.test(token)) return null;
  return { id: match[1], token };
}

function sanitizeEncryptedBackup(value) {
  const iv = String(value?.iv || "");
  const ciphertext = String(value?.ciphertext || "");
  if (
    value?.version !== 1
    || !/^[A-Za-z0-9_-]{16}$/.test(iv)
    || ciphertext.length < 24
    || ciphertext.length > 480000
    || !/^[A-Za-z0-9_-]+$/.test(ciphertext)
  ) return null;
  return { version: 1, iv, ciphertext };
}

async function findAuthorizedBackup(credentials, env) {
  const row = await env.DB.prepare(`
    SELECT payload_json, updated_at
    FROM cloud_backups
    WHERE id = ?1 AND auth_token = ?2
  `).bind(credentials.id, credentials.token).first();
  return row || null;
}

async function saveCloudBackup(request, env, headers, credentials) {
  let body;
  try {
    body = sanitizeEncryptedBackup(await readJson(request));
  } catch (_) {
    return json({ error: "Geçersiz veya çok büyük yedek." }, 400, headers);
  }
  if (!body) return json({ error: "Geçersiz şifreli yedek." }, 400, headers);

  const existing = await env.DB.prepare("SELECT auth_token FROM cloud_backups WHERE id = ?1")
    .bind(credentials.id)
    .first();
  if (existing && existing.auth_token !== credentials.token) {
    return json({ error: "Yedek bulunamadı veya kurtarma kodu yanlış." }, 404, headers);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO cloud_backups (id, auth_token, payload_json, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?4)
    ON CONFLICT(id) DO UPDATE SET
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).bind(credentials.id, credentials.token, JSON.stringify(body), now).run();
  return json({ ok: true, updatedAt: now }, existing ? 200 : 201, headers);
}

async function getCloudBackup(env, headers, credentials) {
  const row = await findAuthorizedBackup(credentials, env);
  if (!row) return json({ error: "Yedek bulunamadı veya kurtarma kodu yanlış." }, 404, headers);
  let payload;
  try {
    payload = JSON.parse(row.payload_json);
  } catch (_) {
    return json({ error: "Bulut yedeği bozuk." }, 500, headers);
  }
  return json({ payload, updatedAt: row.updated_at }, 200, headers);
}

async function removeCloudBackup(env, headers, credentials) {
  const row = await findAuthorizedBackup(credentials, env);
  if (!row) return json({ error: "Yedek bulunamadı veya kurtarma kodu yanlış." }, 404, headers);
  await env.DB.prepare("DELETE FROM cloud_backups WHERE id = ?1 AND auth_token = ?2")
    .bind(credentials.id, credentials.token)
    .run();
  return json({ ok: true }, 200, headers);
}

function istanbulParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ISTANBUL_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== "literal") result[part.type] = part.value;
    return result;
  }, {});
  return {
    weekday: WEEKDAY_INDEX[parts.weekday],
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

function dueNotifications(schedule, now) {
  const local = istanbulParts(now);
  return schedule.flatMap((item) => {
    if (item.type === "assignment") {
      const dueAt = new Date(item.dueAt);
      const difference = Math.ceil((dueAt - now) / 60000);
      return difference <= item.reminderMinutes && difference >= item.reminderMinutes - 2
        ? [{ ...item, dateKey: item.dueAt }]
        : [];
    }
    if (item.day !== local.weekday) return [];
    const [hours, minutes] = item.start.split(":").map(Number);
    const difference = hours * 60 + minutes - local.minutes;
    return difference <= item.reminderMinutes && difference >= item.reminderMinutes - 2
      ? [{ ...item, dateKey: local.dateKey }]
      : [];
  });
}

function reminderLabel(minutes) {
  if (minutes % 1440 === 0) return `${minutes / 1440} gün`;
  if (minutes % 60 === 0) return `${minutes / 60} saat`;
  return `${minutes} dakika`;
}

async function sendScheduledNotification(subscriptionRow, item, env) {
  const notificationKey = item.type === "assignment"
    ? `assignment:${item.id || item.name}:${item.dateKey}:${item.reminderMinutes}`
    : `course:${item.dateKey}:${item.code || item.name}:${item.start}:${item.reminderMinutes}`;
  const alreadySent = await env.DB.prepare(`
    SELECT 1 FROM notification_log
    WHERE subscription_id = ?1 AND notification_key = ?2
  `).bind(subscriptionRow.id, notificationKey).first();
  if (alreadySent) return;

  const subscription = {
    endpoint: subscriptionRow.endpoint,
    expirationTime: null,
    keys: { p256dh: subscriptionRow.p256dh, auth: subscriptionRow.auth },
  };
  const siteUrl = String(env.SITE_URL || "").replace(/\/$/, "");
  const isAssignment = item.type === "assignment";
  const message = {
    data: JSON.stringify({
      title: isAssignment ? `Ödev teslimi yaklaşıyor: ${item.name}` : `${item.name} ${reminderLabel(item.reminderMinutes)} içinde`,
      body: isAssignment
        ? `${item.course || "Ödev"} · Teslime ${reminderLabel(item.reminderMinutes)} kaldı`
        : `${item.start}${item.room ? ` · ${item.room}` : ""}`,
      url: `${siteUrl}/#${isAssignment ? "assignments" : "home"}`,
      icon: `${siteUrl}/assets/icon-192.png`,
      badge: `${siteUrl}/assets/icon-192.png`,
      tag: notificationKey,
    }),
    options: { ttl: 3600, urgency: "high" },
  };
  const vapid = {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_SERVER_PUBLIC_KEY,
    privateKey: env.VAPID_SERVER_PRIVATE_KEY,
  };
  const payload = await buildPushPayload(message, subscription, vapid);
  const response = await fetch(subscription.endpoint, payload);
  if (response.ok) {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO notification_log
        (subscription_id, notification_key, sent_at)
      VALUES (?1, ?2, ?3)
    `).bind(subscriptionRow.id, notificationKey, new Date().toISOString()).run();
    return;
  }
  if (response.status === 404 || response.status === 410) {
    await env.DB.prepare("DELETE FROM subscriptions WHERE id = ?1")
      .bind(subscriptionRow.id)
      .run();
  }
  throw new Error(`Push servisi ${response.status} döndürdü.`);
}

async function runScheduledNotifications(env) {
  const { results = [] } = await env.DB.prepare(`
    SELECT id, endpoint, p256dh, auth, schedule_json
    FROM subscriptions
    WHERE enabled = 1
  `).all();
  const now = new Date();
  for (const subscription of results) {
    let schedule;
    try {
      schedule = sanitizeSchedule(JSON.parse(subscription.schedule_json));
    } catch (_) {
      continue;
    }
    for (const item of dueNotifications(schedule, now)) {
      try {
        await sendScheduledNotification(subscription, item, env);
      } catch (error) {
        console.error("Push gönderilemedi", subscription.id, error);
      }
    }
  }
  const cutoff = new Date(Date.now() - 35 * 86400000).toISOString();
  await env.DB.prepare("DELETE FROM notification_log WHERE sent_at < ?1").bind(cutoff).run();
  const staleSubscriptionCutoff = new Date(Date.now() - 180 * 86400000).toISOString();
  await env.DB.prepare("DELETE FROM subscriptions WHERE updated_at < ?1").bind(staleSubscriptionCutoff).run();
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/health") return json({ ok: true, service: "ders-pusulasi-push" });

  const origin = allowedOrigin(request, env);
  if (!origin) return json({ error: "Bu origin için erişim izni yok." }, 403);
  const headers = corsHeaders(origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...SECURITY_HEADERS, ...headers } });

  if (url.pathname === "/config" && request.method === "GET") {
    return json({ vapidPublicKey: env.VAPID_SERVER_PUBLIC_KEY }, 200, headers);
  }
  if (url.pathname === "/subscriptions" && request.method === "POST") {
    return saveSubscription(request, env, headers);
  }
  if (url.pathname === "/subscriptions" && request.method === "DELETE") {
    return removeSubscription(request, env, headers);
  }
  if (url.pathname.startsWith("/backups/")) {
    const credentials = backupCredentials(request, url);
    if (!credentials) return json({ error: "Geçersiz yedek isteği." }, 400, headers);
    if (request.method === "PUT") return saveCloudBackup(request, env, headers, credentials);
    if (request.method === "GET") return getCloudBackup(env, headers, credentials);
    if (request.method === "DELETE") return removeCloudBackup(env, headers, credentials);
  }
  return json({ error: "Bulunamadı." }, 404, headers);
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error(error);
      const origin = allowedOrigin(request, env);
      return json({ error: "Sunucu hatası." }, 500, origin ? corsHeaders(origin) : {});
    }
  },
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(runScheduledNotifications(env));
  },
};
