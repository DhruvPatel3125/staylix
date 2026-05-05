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
                console.log(`\n[REDIS] Cache HIT for: ${key}`);
                return res.json(JSON.parse(cachedData));
            }

            res.originalJson = res.json;
            res.json = (data) => {
                console.log(`\n[REDIS] Saving to cache: ${key}`);

                if (redisClient.isRedisReady && redisClient.isRedisReady()) {
                    redisClient.setEx(key, ttl, JSON.stringify(data)).catch((err) => {
                        console.error(`[REDIS] Cache write failed for ${key}:`, err.message);
                    });
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
