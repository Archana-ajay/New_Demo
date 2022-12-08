const redis = require('redis');

//create redis client
const client = redis.createClient();
    
client.on('connect',() => {
    console.log("Connecting to the Redis");
}); 

//connection
client.connect()
.catch((err) => {
    console.log("Error in the Connection" + err.message);
});

module.exports = client;