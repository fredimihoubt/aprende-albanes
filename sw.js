const CACHE = 'sqpl-cache-v1';
const ASSETS = [
  // En GitHub Pages usa rutas relativas (sin slash inicial)
  'index.html','styles.css','app.js','games/game.js','i18n/phrases.json','i18n/ui.json',
  'img/house.png','img/table.png','img/apple.png','img/bread.png','img/npc.png',
  'manifest.webmanifest'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
