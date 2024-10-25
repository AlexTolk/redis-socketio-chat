const { createClient } = require('redis');
const { createAdapter } = require("@socket.io/redis-adapter");

const localID = '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) +
    (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) +
    (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);

const client = createClient(
    {url: 'redis://redis:6379',}
);
const pubClient = client.duplicate();
const subClient = pubClient.duplicate();

async function connectClients() {
    await client.connect();
    await pubClient.connect();
    await subClient.connect();
}
connectClients();

async function pub(type, payload) {
    payload.publisher = localID;
    return pubClient.publish(type, JSON.stringify(payload));
}

async function sub(type, callback) {
    return subClient.subscribe(type, (message) => {
        const payload = JSON.parse(message);
        if (payload.publisher === localID) return;
        callback(payload);
    });
}

module.exports = {
    pub,
    sub,
};
