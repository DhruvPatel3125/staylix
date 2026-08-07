// Redis removed — this is a no-op stub so existing imports don't crash
module.exports = {
    get: async () => null,
    set: async () => null,
    setEx: async () => null,
    del: async () => null,
    flushAll: async () => null,
    isOpen: false,
    isReady: false,
    connectPromise: Promise.resolve(),
    isRedisReady: () => false,
};
