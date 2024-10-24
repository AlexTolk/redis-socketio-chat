const {createClient} = require('redis');

const localID =  '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6) + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);


const client = createClient();
const pubClient = client.duplicate();
const subClient = client.duplicate();

async function connectClients() {
    await client.connect();
    await pubClient.connect();
    await subClient.connect();
}
connectClients();

async function get(key, defaultValue) {
    const value = await client.get(key);
    return value || defaultValue || null;
};

async function set(key, value) {
    if (!value) {
        await client.del(String(key));
    } else {
        await client.set(String(key), String(value));
    }  
};
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
    get,
    set,
    del: client.del,
    pub,
    sub
}