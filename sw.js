// Ouve a chegada de uma notificação Push do servidor
self.addEventListener('push', (event) => {
    let data = { title: 'Nova Notificação', body: 'Você tem uma atualização!' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/atarashii-192.png', // Caminho do ícone do seu App
        badge: '/atarashii-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        }
    };

    // Força o sistema operacional a exibir o banner nativo
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Abre ou foca o seu app
    );
});
