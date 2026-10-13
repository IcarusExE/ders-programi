const CACHE_NAME = "ders-pusulasi-v43";
const ASSETS = [
  "./",
  "./index.html",
  "./theme-init.js",
  "./styles.css",
  "./app.js",
  "./push-config.js",
  "./schedule.json",
  "./menu.json",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/nallihan-myo-logo.webp",
];
const OFFLINE_PAGE = new URL("./index.html", self.registration.scope).href;
const SCHEDULE_URL = new URL("./schedule.json", self.registration.scope).href;
const MENU_URL = new URL("./menu.json", self.registration.scope).href;
const CACHEABLE_URLS = new Set(ASSETS.map((asset) => new URL(asset, self.registration.scope).href));

async function fetchAndCache(request, cacheKey = request) {
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKey, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetchAndCache(event.request, OFFLINE_PAGE).catch(() => caches.match(OFFLINE_PAGE)));
    return;
  }

  if (!CACHEABLE_URLS.has(requestUrl.href)) return;
  if (requestUrl.href === SCHEDULE_URL || requestUrl.href === MENU_URL) {
    event.respondWith(fetchAndCache(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetchAndCache(event.request))
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (_) {
    data = { title: "Ders Pusulası", body: event.data?.text() || "Yeni bir ders bildirimin var." };
  }
  const title = data.title || "Ders Pusulası";
  const options = {
    body: data.body || "Ders programını kontrol et.",
    icon: data.icon || "assets/icon-192.png",
    badge: data.badge || "assets/icon-192.png",
    tag: data.tag || "ders-pusulasi",
    renotify: false,
    data: { url: data.url || "./#home" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedUrl = new URL(event.notification.data?.url || "./#home", self.registration.scope);
  const targetUrl = requestedUrl.origin === self.location.origin && requestedUrl.href.startsWith(self.registration.scope)
    ? requestedUrl.href
    : new URL("./#home", self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      const appClient = clients.find((client) => client.url.startsWith(self.registration.scope));
      if (appClient) {
        await appClient.navigate(targetUrl);
        return appClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
