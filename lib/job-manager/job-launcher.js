require('bull');

module.exports = {

  launch({ job }) {
    const data = job.data;
    const queue = job.queue;

    queue.add(data);
  },
};