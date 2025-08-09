const CACHE='albanes-pro-v3'; 
const ASSETS=['index.html','styles.css','app.js','i18n/content.json','manifest.webmanifest','img/food.png','img/house.png','img/market.png','img/travel.png','img/study.png','img/people.png','img/icon-192.png','img/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});