// Escuta o evento de Notificação vindo do Render / Google Push Service
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'Notificação do App';
  const options = {
    body: data.body || 'Você tem uma nova mensagem.',
    icon: 'atarashii-192.png', // Ícone do seu app
    badge: 'atarashii-192.png',
    vibrate: [100, 50, 100]    // Faz o celular vibrar
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Ação ao clicar no pop-up da notificação no celular
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Abre a raiz do seu site
  );
});