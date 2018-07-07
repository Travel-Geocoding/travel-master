#! /usr/bin/env node
const request = require('request-promise-native');
const path = require('path');
const moment = require('moment');
const fileSystem = require('fs');
const Json2csvParser = require('json2csv').Parser;
const CLIProgressBar = require('cli-progress');

const CSV_HEADERS = {
  ID: 'ID',
  STATE: 'Etat',
  START_ID: 'ID Départ',
  START_LATITUDE: 'Latitude Départ',
  START_LONGITUDE: 'Longitude Départ',
  DESTINATION_ID: 'ID Arrivée',
  DESTINATION_LATITUDE: 'Latitude Arrivée',
  DESTINATION_LONGITUDE: 'Longitude Arrivée',
  STRAIT_DISTANCE: 'Distance à vol d‘oiseau (en m)',
  GOOGLE_STATUS: 'Status requête google',
  TRAVEL_MODE: 'Mode de transport',
  TRAVEL_DISTANCE: 'Distance de trajet (en m)',
  TRAVEL_DURATION: 'Durée de trajet (en s)',
  TRAVEL_DURATION_TEXT: 'Durée de trajet en texte',
  TRAVEL_IN_TRAFFIC_DISTANCE: 'Distance de trajet (en m) - avec circulation',
  TRAVEL_IN_TRAFFIC_DURATION: 'Durée de trajet (en s) - avec circulation',
  TRAVEL_IN_TRAFFIC_DURATION_TEXT: 'Durée de trajet en texte - avec circulation',
};

const CSV_HEADER_ORDERED_LIST = [
  CSV_HEADERS.ID,
  CSV_HEADERS.STATE,
  CSV_HEADERS.START_ID,
  CSV_HEADERS.START_LATITUDE,
  CSV_HEADERS.START_LONGITUDE,
  CSV_HEADERS.DESTINATION_ID,
  CSV_HEADERS.DESTINATION_LATITUDE,
  CSV_HEADERS.DESTINATION_LONGITUDE,
  CSV_HEADERS.STRAIT_DISTANCE,
  CSV_HEADERS.GOOGLE_STATUS,
  CSV_HEADERS.TRAVEL_MODE,
  CSV_HEADERS.TRAVEL_DISTANCE,
  CSV_HEADERS.TRAVEL_DURATION,
  CSV_HEADERS.TRAVEL_DURATION_TEXT,
  CSV_HEADERS.TRAVEL_IN_TRAFFIC_DISTANCE,
  CSV_HEADERS.TRAVEL_IN_TRAFFIC_DURATION,
  CSV_HEADERS.TRAVEL_IN_TRAFFIC_DURATION_TEXT,
];

const CSV_DELIMITATOR = ';';
const CSV_EOL = '\r\n';

const argv = require('yargs')
  .option('localhost', {
    alias: 'L',
    describe: 'launch local requests instead of to the server',
  })
  .boolean('localhost')
  .option('folder', {
    alias: 'f',
    describe: 'the folder where to create the csv file',
  })
  .option('token', {
    alias: 't',
    describe: 'the token to authenticate with the server',
  })
  .demandOption(['folder', 'token'], 'Please provide the path to the csv file of address to process and the api token')
  .help()
  .wrap(120)
  .argv;

function buildRequestObject({ isLocalRequest, token, pageNumber }) {
  const baseUrl = isLocalRequest ? 'http://localhost:5000' : 'https://travel-master.scalingo.io';

  return {
    baseUrl,
    url: '/route',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    json: true,
    qs: {
      page: pageNumber,
    },
  };
}

function createFile({ folderPath, firstPartOfCSV }) {
  const fileName = `route_export_${moment().format('DD-MM-YYYY_HH-mm-ss')}.csv`;
  const filePath = path.join(folderPath, fileName);

  fileSystem.writeFileSync(filePath, firstPartOfCSV);
  return filePath;
}

function generateRowFromRouteJSON(routeJSON) {
  const rowToComplete = {};

  rowToComplete[CSV_HEADERS.ID] = routeJSON.id;
  rowToComplete[CSV_HEADERS.STATE] = routeJSON.state;
  rowToComplete[CSV_HEADERS.START_ID] = routeJSON.startId;
  rowToComplete[CSV_HEADERS.START_LATITUDE] = routeJSON.startLatitude;
  rowToComplete[CSV_HEADERS.START_LONGITUDE] = routeJSON.startLongitude;
  rowToComplete[CSV_HEADERS.DESTINATION_ID] = routeJSON.destinationId;
  rowToComplete[CSV_HEADERS.DESTINATION_LATITUDE] = routeJSON.destinationLatitude;
  rowToComplete[CSV_HEADERS.DESTINATION_LONGITUDE] = routeJSON.destinationLongitude;
  rowToComplete[CSV_HEADERS.STRAIT_DISTANCE] = routeJSON.straitDistance;
  rowToComplete[CSV_HEADERS.GOOGLE_STATUS] = routeJSON.googleStatus;
  rowToComplete[CSV_HEADERS.TRAVEL_MODE] = routeJSON.travelMode;
  rowToComplete[CSV_HEADERS.TRAVEL_DISTANCE] = routeJSON.travelDistance;
  rowToComplete[CSV_HEADERS.TRAVEL_DURATION] = routeJSON.travelDuration;
  rowToComplete[CSV_HEADERS.TRAVEL_DURATION_TEXT] = routeJSON.travelDurationText;
  rowToComplete[CSV_HEADERS.TRAVEL_IN_TRAFFIC_DISTANCE] = routeJSON.travelInTrafficDistance;
  rowToComplete[CSV_HEADERS.TRAVEL_IN_TRAFFIC_DURATION] = routeJSON.travelInTrafficDuration;
  rowToComplete[CSV_HEADERS.TRAVEL_IN_TRAFFIC_DURATION_TEXT] = routeJSON.travelInTrafficDurationText;

  return rowToComplete;
}

function main() {

  console.log('\nScript Started');

  const token = argv.token;
  const folderPath = argv.folder;
  const isLocalRequest = argv.localhost;
  const progressBar = new CLIProgressBar.Bar({}, CLIProgressBar.Presets.rect);
  const parser = new Json2csvParser({
    fields: CSV_HEADER_ORDERED_LIST,
    delimiter: CSV_DELIMITATOR,
    eol: CSV_EOL,
    withBOM: true,
  });
  const parserWithoutHeader = new Json2csvParser({
    fields: CSV_HEADER_ORDERED_LIST,
    delimiter: CSV_DELIMITATOR,
    eol: CSV_EOL,
    header: false,
  });

  let totalPageCount = 0;
  let totalRowCount = 0;

  Promise.resolve()
    .then(() => {
      return buildRequestObject({ isLocalRequest, token, pageNumber: 1 });
    })
    .then((requestConfig) => {
      return request(requestConfig);
    })
    .then((RoutePageResult) => {
      totalPageCount = RoutePageResult.page.totalPageCount;
      totalRowCount = RoutePageResult.page.totalRowCount;

      return RoutePageResult.routes;
    })
    .then((routes) => routes.map(generateRowFromRouteJSON))
    .then((routeCSVRows) => parser.parse(routeCSVRows) + CSV_EOL)
    .then((firstPartOfCSV) => {
      const filePath = createFile({ folderPath, firstPartOfCSV });

      console.log('Les données d‘itinéraires sont dans le fichier :' + filePath);

      progressBar.start(totalPageCount, 1);

      return filePath;
    })
    .then((filePath) => {

      const initialPromise = Promise.resolve();

      return Array.from({ length: totalPageCount - 1 }, (v, i) => i + 2)
        .reduce((sequentialPromises, pageNumber) => {
          const requestConfig = buildRequestObject({ isLocalRequest, token, pageNumber });

          return sequentialPromises
            .then(() => request(requestConfig))
            .then((RoutePageResult) => {
              progressBar.update(RoutePageResult.page.currentPageNumber);

              return RoutePageResult.routes;
            })
            .then((routes) => routes.map(generateRowFromRouteJSON))
            .then((routeCSVRows) => parserWithoutHeader.parse(routeCSVRows) + CSV_EOL)
            .then((routeCSVString) => fileSystem.appendFileSync(filePath, routeCSVString));

        }, initialPromise);

    })
    .then(() => {
      progressBar.stop();
      console.log('Data uploaded');
    })
    .then(() => {
      console.log('\nScript Finished');
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

main();