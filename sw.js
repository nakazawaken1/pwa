self.addEventListener("install", (e) => {
  console.log("Service Worker Installed");
});
self.addEventListener('push', event => {
  const data = event.data.json();
  console.log(data);
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body
  }).then(() => {
    console.log('Notification shown');
  }).catch(error => {
    console.error('Error showing notification:', error);
  }));
});
self.addEventListener("notificationclick", (event) => {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          console.log(client.url);
          if (new URL(client.url).pathname === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      }));
});
