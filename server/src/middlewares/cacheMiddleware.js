// Cache middleware removed — pass-through (no Redis dependency)
const cacheMiddleware = (ttl = 3600) => {
    return (req, res, next) => {
        next();
    };
};

module.exports = cacheMiddleware;
