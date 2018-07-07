const State = {
  DONE: 'DONE',
  NEED_GOOGLE: 'NEED_GOOGLE_PROCESSING',
  PROCESSING: 'PROCESSING...',
};

class Route {

  constructor({
    id,
    // Location.State ENUM
    state,

    // start location information
    startId,
    startLatitude,
    startLongitude,

    // destination location information
    destinationId,
    destinationLatitude,
    destinationLongitude,

    // distance using coordinates
    straitDistance,

    // google api call status
    googleStatus,
    travelMode,

    // google direction call result
    travelDistance,
    travelDuration,
    travelDurationText,

    // google direction call result (advanced result direction API)
    travelInTrafficDistance,
    travelInTrafficDuration,
    travelInTrafficDurationText,
  }) {
    this.id = id;
    this.state = state;
    this.startId = startId;
    this.startLatitude = startLatitude;
    this.startLongitude = startLongitude;
    this.destinationId = destinationId;
    this.destinationLatitude = destinationLatitude;
    this.destinationLongitude = destinationLongitude;
    this.straitDistance = straitDistance;
    this.googleStatus = googleStatus;
    this.travelMode = travelMode;
    this.travelDistance = travelDistance;
    this.travelDuration = travelDuration;
    this.travelDurationText = travelDurationText;
    this.travelInTrafficDistance = travelInTrafficDistance;
    this.travelInTrafficDuration = travelInTrafficDuration;
    this.travelInTrafficDurationText = travelInTrafficDurationText;
  }

  static createFromLocations({ start, destination, straitDistance, state }) {
    return new Route({
      id: Route.generateIdFor({ start, destination }),
      state,
      startId: start.id,
      startLatitude: start.latitude,
      startLongitude: start.longitude,
      destinationId: destination.id,
      destinationLatitude: destination.latitude,
      destinationLongitude: destination.longitude,
      straitDistance,
    });
  }

  get reversedRouteId() {
    return Route.generateIdFor({
      start: { id: this.destinationId },
      destination: { id: this.startId },
    });
  }

  static generateIdFor({ start, destination }) {
    return `${start.id}-${destination.id}`;
  }
}

Route.State = State;

module.exports = Route;
