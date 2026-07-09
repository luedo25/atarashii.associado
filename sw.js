// sw.js
const CACHE_NAME = 'associado-cache-v2';

// Força o PWA a se ativar imediatamente sem esperar o usuário fechar a aba
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Responde às requisições da página (obrigatório para validar o PWA no celular)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
