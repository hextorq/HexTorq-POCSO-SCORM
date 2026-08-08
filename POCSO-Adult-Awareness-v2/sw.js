const VIDEO_CACHE = "pocso-video-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "CACHE_VIDEOS" || !Array.isArray(event.data.urls)) return;
  event.waitUntil(cacheVideos(event.data.urls));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.includes("/video/") || !url.pathname.endsWith(".mp4")) return;

  event.respondWith(handleVideoRequest(event.request));
});

async function cacheVideos(urls) {
  const cache = await caches.open(VIDEO_CACHE);
  await runLimited(Array.from(new Set(urls)), 3, async (url) => {
    const request = new Request(url, { cache: "reload" });
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return;
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
  });
}

async function handleVideoRequest(request) {
  const cache = await caches.open(VIDEO_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });

  if (cached) {
    const range = request.headers.get("range");
    if (range) return makeRangeResponse(cached, range);
    return cached;
  }

  const response = await fetch(request);
  const range = request.headers.get("range");
  if (!range && response && response.ok) {
    cache.put(request, response.clone()).catch(() => {});
  } else {
    cacheFullVideo(request.url).catch(() => {});
  }
  return response;
}

async function cacheFullVideo(url) {
  const cache = await caches.open(VIDEO_CACHE);
  const request = new Request(url, { cache: "reload" });
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return;
  const response = await fetch(request);
  if (response && response.ok) await cache.put(request, response.clone());
}

async function makeRangeResponse(response, rangeHeader) {
  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;
  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!match) return response;

  let start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : size - 1;
  if (!match[1] && match[2]) {
    const suffixLength = Number(match[2]);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` }
    });
  }

  end = Math.min(end, size - 1);
  const chunk = buffer.slice(start, end + 1);
  const headers = new Headers(response.headers);
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(chunk.byteLength));
  headers.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");

  return new Response(chunk, {
    status: 206,
    statusText: "Partial Content",
    headers
  });
}

async function runLimited(items, limit, worker) {
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      try { await worker(item); } catch (e) { /* cache remains best effort */ }
    }
  });
  await Promise.all(runners);
}
