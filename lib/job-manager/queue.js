const BullQueue = require('bull');
const REDIS_URL = process.env.SCALINGO_REDIS_URL;

const Queue = {
  GEOCODING: new BullQueue('GEOCODING Queue', REDIS_URL),
  UPDATE_DATA: new BullQueue('UDPATE DATA Queue', REDIS_URL),
  LAUNCH_ROUTE_CALCULATION: new BullQueue('LAUNCH ROUTE CALCULATION Queue', REDIS_URL),
  ROUTES_FOR_LOCATION: new BullQueue('ROUTES FOR LOCATION Queue', REDIS_URL),
  INSERT_ROUTE: new BullQueue('INSERT ROUTE Queue', REDIS_URL),
  LAUNCH_BULK_API_JOBS: new BullQueue('LAUNCH BULK API JOBS Queue', REDIS_URL),
};

console.log('> connected to redis at: ' + REDIS_URL);
module.exports = Queue;