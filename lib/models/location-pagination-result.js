class LocationPaginationResult {

  constructor({
    locations = [],
    page,
  }) {
    this.locations = locations;
    this.page = page;
  }
}

module.exports = LocationPaginationResult;
