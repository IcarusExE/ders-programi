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

function sanitizeSchedule(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).flatMap((course) => {
    const day = Number(course?.day);
    const start = String(course?.start || "");
    const name = String(course?.name || "").trim().slice(0, 160);
    if (!Number.isInteger(day) || day < 0 || day > 6 || !validTime(start) || !name) return [];
    return [{
      day,
      start,
      name,
      code: String(course?.code || "").trim().slice(0, 40),
      room: String(course?.room || "").trim().slice(0, 120),
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
  if (!subscription || !schedule.length) {
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

function dueCourses(schedule, now) {
  const local = istanbulParts(now);
  return schedule.filter((course) => {
    if (course.day !== local.weekday) return false;
    const [hours, minutes] = course.start.split(":").map(Number);
    const difference = hours * 60 + minutes - local.minutes;
    return difference === 14 || difference === 15;
  }).map((course) => ({ ...course, dateKey: local.dateKey }));
}

async function sendCourseNotification(subscriptionRow, course, env) {
  const notificationKey = `${course.dateKey}:${course.code || course.name}:${course.start}`;
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
  const message = {
    data: JSON.stringify({
      title: `${course.name} 15 dakika içinde`,
      body: `${course.start}${course.room ? ` · ${course.room}` : ""}`,
      url: `${siteUrl}/#home`,
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
    for (const course of dueCourses(schedule, now)) {
      try {
        await sendCourseNotification(subscription, course, env);
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
