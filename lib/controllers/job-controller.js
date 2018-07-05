queue = require('../job-manager/queue');

module.exports = {

  getJobStatus(request, h) {

    const jobCountObjectByQueueNamePromises = Object.entries(queue)
      .map(([queueName, queue]) => {

        return queue.getJobCounts()
          .then((jobCountObject) => {

            return [queueName, jobCountObject];
          });
      });

    return Promise.all(jobCountObjectByQueueNamePromises)
      .then((jobCountObjectByQueueName) => {

        return jobCountObjectByQueueName
          .reduce((responseObject, [queueName, jobCountObject]) => {

            responseObject[queueName] = jobCountObject;
            return responseObject;
          }, {});
      })
      .then((responseObject) => {

        return h.response(responseObject);
      });
  },

  launchJob(request, h) {

    let job;
    const { jobName } = request.payload;

    console.log(request.payload);

    if (jobName === 'LAUNCH_ROUTE_CALCULATION') {

      job = Job.initiateRouteCaluculation();
      JobLauncher.launch({ job });
    }

    return h.response()
      .code(204);
  },
};
