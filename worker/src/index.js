import { buildPushPayload } from "@block65/webcrypto-web-push";

const ISTANBUL_TIMEZONE = "Europe/Istanbul";
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
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
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
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
  if (!endpoint.startsWith("https://") || endpoint.length > 2048 || !p256dh || !auth) return null;
  return { endpoint, expirationTime: value?.expirationTime || null, keys: { p256dh, auth } };
}

async function saveSubscription(request, env, headers) {
  const body = await request.json();
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
  const body = await request.json();
  const endpoint = String(body.endpoint || "");
  if (!endpoint.startsWith("https://")) return json({ error: "Geçersiz abonelik." }, 400, headers);
  await env.DB.prepare("DELETE FROM subscriptions WHERE id = ?1")
    .bind(await endpointId(endpoint))
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
      return difference === item.reminderMinutes || difference === item.reminderMinutes - 1
        ? [{ ...item, dateKey: item.dueAt }]
        : [];
    }
    if (item.day !== local.weekday) return [];
    const [hours, minutes] = item.start.split(":").map(Number);
    const difference = hours * 60 + minutes - local.minutes;
    return difference === item.reminderMinutes || difference === item.reminderMinutes - 1
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
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/health") return json({ ok: true, service: "ders-pusulasi-push" });

  const origin = allowedOrigin(request, env);
  if (!origin) return json({ error: "Bu origin için erişim izni yok." }, 403);
  const headers = corsHeaders(origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

  if (url.pathname === "/config" && request.method === "GET") {
    return json({ vapidPublicKey: env.VAPID_SERVER_PUBLIC_KEY }, 200, headers);
  }
  if (url.pathname === "/subscriptions" && request.method === "POST") {
    return saveSubscription(request, env, headers);
  }
  if (url.pathname === "/subscriptions" && request.method === "DELETE") {
    return removeSubscription(request, env, headers);
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
