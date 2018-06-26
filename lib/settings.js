const path = require('path');

module.exports = (function() {

  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3000,

    environment: (process.env.NODE_ENV || 'development'),

    redisUrl: process.env.REDIS_URL

  };

  return config;

})();
