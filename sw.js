const CACHE_NAME = "cozy-cafe-v2";

const STATIC_FILES = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json"
];


// ========================================
// INSTALL
// ========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(STATIC_FILES);

            })

    );

    self.skipWaiting();

});


// ========================================
// ACTIVATE
// ========================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))

                );

            })

    );

    self.clients.claim();

});


// ========================================
// FETCH
// ========================================

self.addEventListener("fetch", event => {

    // Never cache API requests
    if (event.request.url.includes("/api/")) {
        return;
    }


    // Only handle GET requests
    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        fetch(event.request)

            .then(response => {

                // Save a fresh copy
                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            copy
                        );

                    });

                return response;

            })

            .catch(() => {

                // If internet/server unavailable,
                // use cached version

                return caches.match(event.request);

            })

    );

});