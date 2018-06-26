class Location {

  constructor({
    id,
    name,
    address,
    postalCode,
    municipality,
    matchType,
    matchedAddress,
    latitude,
    longitude,
  }) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.postalCode = postalCode;
    this.municipality = municipality;
    this.matchType = matchType;
    this.matchedAddress = matchedAddress;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

module.exports = Location;
