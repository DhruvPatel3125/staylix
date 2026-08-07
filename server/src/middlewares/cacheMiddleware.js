const redisClient = require('../config/redis');

const cacheMiddleware = (ttl = 3600) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        if (!redisClient.isRedisReady || !redisClient.isRedisReady()) {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await redisClient.get(key);

            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);
                    if (parsed && parsed.success !== false) {
                        console.log(`\n[REDIS] Cache HIT for: ${key}`);
                        return res.json(parsed);
                    }
                } catch (e) {}
                
                // Evict corrupted/failed cache
                console.log(`\n[REDIS] Evicting bad cache key: ${key}`);
                await redisClient.del(key).catch(() => {});
            }

            res.originalJson = res.json;
            res.json = (data) => {
                const isSuccessStatus = res.statusCode >= 200 && res.statusCode < 300;
                const isSuccessPayload = !data || data.success !== false;

                if (isSuccessStatus && isSuccessPayload && redisClient.isRedisReady && redisClient.isRedisReady()) {
                    console.log(`\n[REDIS] Saving to cache: ${key}`);
                    redisClient.setEx(key, ttl, JSON.stringify(data)).catch((err) => {
                        console.error(`[REDIS] Cache write failed for ${key}:`, err.message);
                    });
                } else if (!isSuccessPayload || !isSuccessStatus) {
                    // Remove bad cache if it exists
                    if (redisClient.isRedisReady && redisClient.isRedisReady()) {
                        redisClient.del(key).catch(() => {});
                    }
                }

                return res.originalJson(data);
            };

            console.log(`\n[REDIS] Cache MISS for: ${key}`);
            return next();
        } catch (error) {
            console.error('[REDIS] Cache middleware error:', error.message);
            return next();
        }
    };
};

module.exports = cacheMiddleware;
