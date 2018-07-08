// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

AddressController = require('../controllers/address-controller');
RouteController = require('../controllers/route-controller');
JobController = require('../controllers/job-controller');
Auth = require('../auth/auth');

const Hapi = require('hapi');

const serverInstance = Hapi.server({
  port: process.env.PORT,
  host: process.env.HOST,
});

serverInstance.auth.scheme('envToken', Auth.scheme);
serverInstance.auth.strategy('default', 'envToken');
serverInstance.auth.default('default');

serverInstance.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    serverInstance.logger().info('server way for accessing it');
    return reply.response(`Hello, world ! Server is Up 😇`);
  },
  options: {
    auth: false,
  },
});

serverInstance.route({
  method: 'POST',
  path: '/address',
  handler: AddressController.launchProcessing,
});

serverInstance.route({
  method: 'GET',
  path: '/address',
  handler: AddressController.getLocationsPaginated,
});

serverInstance.route({
  method: 'GET',
  path: '/route',
  handler: RouteController.getRoutesPaginated,
});

serverInstance.route({
  method: 'GET',
  path: '/route/count',
  handler: RouteController.getRouteCount,
});

serverInstance.route({
  method: 'GET',
  path: '/job',
  handler: JobController.getJobStatus,
});

serverInstance.route({
  method: 'POST',
  path: '/job',
  handler: JobController.launchJob,
});

module.exports = serverInstance;
