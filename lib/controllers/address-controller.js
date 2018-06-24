Job = require('../job-manager/job');
JobLauncher = require('../job-manager/job-launcher');

module.exports = {

  launchProcessing(request, reply) {

    const job = Job.createLocationFromAddress({ address: '16 rue desaix' });

    JobLauncher.launch({ job });

    return reply.response()
      .code(204);
  },
};
