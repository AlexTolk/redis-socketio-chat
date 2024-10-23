const {createClient} = require('redis');

const client = createClient();

client.connect();

async function get(key, defaultValue) {
    const value = await client.get(key);
    return value || defaultValue || null;
};

async function set(key, value) {
    if (!value) {
        await client.del(key);
    } else {
        await client.set(key, value);
    }  
};

module.exports = {
    get,
    set,
    del: client.del
}