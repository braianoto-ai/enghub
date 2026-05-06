const CACHE_NAME = "enghub-v1";

// Recursos estáticos para cachear na instalação
const PRECACHE_URLS = [
  "/",
  "/buscar",
  "/planos",
  "/offline",
];

// Instala e pré-cacheia recursos essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Limpa caches antigos ao ativar
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: Network First para páginas, Cache First para assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET e de outras origens
  if (request.method !== "GET") return;
  if (!url.origin.includes(self.location.origin)) return;

  // Assets estáticos (_next/static): Cache First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Imagens: Cache First com fallback de rede
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).catch(() => new Response("", { status: 404 }))
      )
    );
    return;
  }

  // API routes: sempre rede, sem cache
  if (url.pathname.startsWith("/api/")) return;

  // Páginas HTML: Network First, fallback para offline
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached ?? caches.match("/offline") ?? new Response("Offline", { status: 503 })
        )
      )
  );
});
