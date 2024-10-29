const redis = require('redis');


const localID = '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) +
    (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) +
    (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);

const client = redis.createClient({ url: process.env.REDIS_URL });
const pubClient = client.duplicate();
const subClient = client.duplicate();

client.connect();
pubClient.connect();
subClient.connect();

client.on('error', (err) => console.error('Redis Client Error', err));
pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

async function get(key, defaultValue) {
    const value = await client.get(key);
    return value || defaultValue || null;
}
async function set(key, value) {
    if (!value) {
        await client.del(key);
    } else {
        await client.set(key, value);
    }
}
async function pub(type, payload) {
    payload.publisher = localID;
    return pubClient.publish(type, JSON.stringify(payload));
}
async function sub(type, callback) {
    subClient.subscribe(type, (message) => {
        const payload = JSON.parse(message);
        if (payload.publisher == localID) return;
        callback(payload); 
    })
}


module.exports = {
    get,
    set,
    pub,
    sub,
    localID,
};
