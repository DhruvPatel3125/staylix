const redisClient = require('../config/redis');

const cacheMiddleware = (ttl = 3600) => {
    return async(req,res,next) => {
        if(req.method !== 'GET'){
            return next();
        }
        const key = `cache:${req.originalUrl || req.url}`;
        try {
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                console.log(`\n🚀 [REDIS] Cache HIT for: ${key}`);
                // console.log(`📦 Data: ${cachedData.substring(0, 100)}...`); // Pehla 100 characters print karne ke liye
                return res.json(JSON.parse(cachedData));
            }

            // Agar data nahi hai, toh original res.json ko override karenge
            res.originalJson = res.json;
            res.json = (data) => {
                console.log(`\n💾 [REDIS] Saving to Cache: ${key}`);
                redisClient.setEx(key, ttl, JSON.stringify(data));
                res.originalJson(data);
            };

            console.log(`\n🔍 [REDIS] Cache MISS for: ${key}`);
            next();
        } catch (error) {
            console.log(error);
            next();
        }
    }
}
module.exports = cacheMiddleware;