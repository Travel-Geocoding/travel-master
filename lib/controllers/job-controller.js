routeRepository = require('../repositories/route-repository');
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

    if (jobName === 'LAUNCH_BULK_API_JOBS') {

      const apiKey = request.payload.apiKey;
      job = Job.launchBulkAPIJobjs({ apiKey });
      JobLauncher.launch({ job });
    }

    if (jobName === 'PAUSE_ROUTE_CALCULATION') {
      const shouldPause = request.payload.pause;

      if (shouldPause) {
        Queue.ROUTES_FOR_LOCATION.pause();
      } else {
        Queue.ROUTES_FOR_LOCATION.resume();
      }
    }

    if (jobName === 'CLEAN_ROUTE_DETAIL_QUEUE') {

      Queue.GEOCODE_ROUTE_DETAIL.clean(1, 'wait')
        .then(routeRepository.resetProcessingToNeedGoogle);
    }

    return h.response()
      .code(204);
  },
};
