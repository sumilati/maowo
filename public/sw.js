// 猫窝 Service Worker - 基础离线缓存
const CACHE_NAME = 'maowo-v1';
const PRECACHE = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// 安装：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求策略：
// - 导航请求 (HTML): 网络优先，失败回退缓存
// - uploads 图片: 缓存优先
// - API: 不缓存（总是网络）
// - 其他静态资源: 缓存优先回退网络
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只处理同源请求
  if (url.origin !== self.location.origin) return;

  // API 请求不缓存
  if (url.pathname.startsWith('/api/')) return;

  // 非 GET 不处理
  if (event.request.method !== 'GET') return;

  // 导航请求：网络优先
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/').then((r) => r || caches.match(event.request)))
    );
    return;
  }

  // uploads 图片：缓存优先
  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return resp;
        }).catch(() => cached)
      )
    );
    return;
  }

  // 其他：缓存优先回退网络
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return resp;
      })
    )
  );
});
