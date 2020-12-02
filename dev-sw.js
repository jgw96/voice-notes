importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.1/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('notificationclick', (event) => {
  clients.openWindow(event.notification.body.split("Memos: ").pop());
});

workbox.routing.registerRoute(
  ({ url }) => url.href.includes("@microsoft/fast-components"),
  new workbox.strategies.CacheFirst(),
);