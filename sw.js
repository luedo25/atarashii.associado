// sw.js
const CACHE_NAME = 'associado-cache-v1';

self.addEventListener('install', (e) => {
  // Opcional: Você pode colocar arquivos para funcionar offline aqui no futuro
});

self.addEventListener('fetch', (event) => {
  // Monitora as requisições (obrigatório para o PWA funcionar)
});