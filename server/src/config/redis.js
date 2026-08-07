const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const maxRetries = Number(process.env.REDIS_MAX_RETRIES || 3);
const connectTimeout = Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 10000);
const redisDisabled = String(process.env.REDIS_DISABLED || 'false').toLowerCase() === 'true';

const client = redis.createClient({
    url: redisUrl,
    socket: {
        connectTimeout,
        reconnectStrategy: (retries) => {
            if (retries >= maxRetries) {
                console.error(`[REDIS] Max retries (${maxRetries}) reached. Disabling reconnect attempts.`);
                return false;
            }

            return Math.min((retries + 1) * 500, 3000);
        }
    }
});

let redisReady = false;

client.on('error',(err)=>
{
    redisReady = false;
    console.log("Redis client error:",err);
}
);

client.on("connect",()=>
console.log("Connected to redis")
);

client.on("ready", async () => {
    redisReady = true;
    console.log("[REDIS] Client is ready. Flushing stale cache...");
    try {
        await client.flushAll();
        console.log("[REDIS] Cache successfully flushed on startup");
    } catch (err) {
        console.error("[REDIS] Flush error:", err.message);
    }
});

client.on("end", () => {
    redisReady = false;
    console.log("[REDIS] Connection closed");
});

const connectPromise = redisDisabled
    ? Promise.resolve().then(() => {
        console.warn('[REDIS] Disabled via REDIS_DISABLED=true. Caching is off.');
    })
    : client.connect().catch((error) => {
        redisReady = false;
        console.error(`[REDIS] Initial connect failed for ${redisUrl}. Caching will be disabled.`, error.message);
    });

const isRedisReady = () => !redisDisabled && client.isOpen && client.isReady && redisReady;

module.exports = client;
module.exports.connectPromise = connectPromise;
module.exports.isRedisReady = isRedisReady;
