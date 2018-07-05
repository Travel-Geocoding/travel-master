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

  static updateLocationFromAddress({ address }) {
    return new Job({
      queue: Queue.UPDATE_DATA,
      data: { address },
    });
  }

  static initiateRouteCaluculation() {
    return new Job({
      queue: Queue.LAUNCH_ROUTE_CALCULATION,
      data: {},
    });
  }
}

module.exports = Job;
