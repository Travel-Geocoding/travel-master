queue = require('../job-manager/queue');

module.exports = {

  getJobStatus(request, reply) {

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
            return responseObject
          }, {});
      })
      .then((responseObject) => {

        return reply.response(responseObject);
      });
  },
};
