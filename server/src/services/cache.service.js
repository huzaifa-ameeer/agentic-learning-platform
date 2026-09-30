const DEFAULT_TTL_MS = 60 * 1000;
const MAX_ENTRIES = 500;

const store = new Map();

export const buildCacheKey = (...parts) => parts.join(":");

export const getCacheEntry = (key) => {
  const entry = store.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value;
};

export const setCacheEntry = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  if (!ttlMs || ttlMs <= 0) {
    return;
  }

  store.set(key, { value, expiresAt: Date.now() + ttlMs });

  while (store.size > MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    store.delete(oldestKey);
  }
};

export const clearCacheEntry = (key) => {
  store.delete(key);
};