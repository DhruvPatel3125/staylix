const redis = require('redis');

const client = redis.createClient({
    url:process.env.REDIS_URL
})

client.on('error',(err)=>
console.log("Redis client error:",err)
);

client.on("connect",()=>
console.log("Connected to redis")
);

(async () => {
    await client.connect();
})();

module.exports = client;