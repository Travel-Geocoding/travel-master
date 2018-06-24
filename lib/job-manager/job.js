Queue = require('./queue');

class Job {

  constructor({
    queue,
    data,
  } = {}) {
    this.queue = queue;
    this.data = data;
  }

  static createLocationFromAddress({ address }) {
    return new Job({
      queue: Queue.GEOCODING,
      data: { address },
    });
  }
}

module.exports = Job;
