const BullQueue = require('bull');
const REDIS_URL = process.env.SCALINGO_REDIS_URL;

const Queue = {
  GEOCODING: new BullQueue('GEOCODING Queue', REDIS_URL),
  UPDATE_DATA: new BullQueue('UDPATE DATA Queue', REDIS_URL),
};

console.log('> connected to redis at: ' + REDIS_URL);
module.exports = Queue;