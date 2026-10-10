const CACHE_NAME = "ders-pusulasi-v22";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./push-config.js",
  "./schedule.json",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/nallihan-myo-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
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
  const targetUrl = new URL(event.notification.data?.url || "./#home", self.location.origin).href;
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
