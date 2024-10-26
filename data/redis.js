const { createClient } = require('redis');
const localID = '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) +
    (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) +
    (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);

const client = createClient({ url: 'redis://redis:6379' });
const pub = client.duplicate();
const sub = client.duplicate();

async function connectClients() {
    try {
        await client.connect();
        await pub.connect();
        await sub.connect();
    } catch (error) {
        console.error("Error connecting to Redis clients:", error);
    }
}


module.exports = {
    connectClients,
    pub,
    sub,
    localID,
};
