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

    const destino = typeof data.url === 'string' && data.url.trim() ? data.url.trim() : 'index.html';
    const options = {
        body: data.body,
        icon: './atarashii-192.png',
        badge: './atarashii-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1',
            url: destino
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
    const destino = event.notification.data?.url || 'index.html';
    const url = new URL(destino, self.registration.scope).href;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(janelas => {
            const existente = janelas.find(janela => janela.url === url);
            return existente ? existente.focus() : clients.openWindow(url);
        })
    );
});
