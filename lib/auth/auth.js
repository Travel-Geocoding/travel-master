Boom = require('boom');

module.exports = {

  scheme(server, options) {
    return {

      authenticate: async (request, reply) => {

        const authorizationHeader = request.headers.authorization;
        const expectedToken = process.env.API_TOKEN || 'token';

        if (!authorizationHeader) {
          throw Boom.unauthorized('Missing authorization header', 'envToken');
        }

        const bearerIndex = authorizationHeader.indexOf('Bearer ');

        if (bearerIndex < 0) {
          throw Boom.unauthorized('Wrong authorization type', 'envToken');
        }

        const bearerToken = authorizationHeader.replace(/Bearer /g, '').trim();

        if (bearerToken !== expectedToken) {
          throw Boom.unauthorized('Wrong authorization token', 'envToken');
        }

        return reply.authenticated({ credentials: 'server' });
      },
    };
  },
};
