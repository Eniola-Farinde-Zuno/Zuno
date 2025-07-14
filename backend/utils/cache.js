const cache = new Map();
const FIVE_MINUTES = 5 * 60 * 1000;
// 5 minutes ttl
const CACHE_TTL = FIVE_MINUTES

const getCacheKey = (userId, operation) => `${userId}_${operation}`;
const setCache = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

const getCache = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    //check if cache has expired
    if (Date.now() - cached.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return cached.data;
};

const invalidateUserCache = (userId) => {
    const keysToDelete = [];
    for (const key of cache.keys()) {
        if (key.startsWith(`${userId}_`)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => cache.delete(key));
};

module.exports = {
    getCacheKey,
    setCache,
    getCache,
    invalidateUserCache
};
