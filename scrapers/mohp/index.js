const axios = require('axios');
const path = require('path');
const { parse } = require('json2csv');

const logger = require('../utils/logger');
const { getCurrDate, appendToCsv } = require('../utils/utils');

/**
 * The root path where the MOHP CSV files are located
 *
 * @var {String}
 */
const mohpCsvPath = path.join(
  path.dirname(require.main.filename),
  '..',
  'data',
  'mohp',
);

/**
 * CSV options for the json2csv parser
 *
 * @var {Object}
 */
const mohpCsvOptions = {
  header: false,
  quote: '',
};

/**
 * Returns a normalized overview data object for the following CSV headers:
 * Date,Confirmed,Recovered,Deaths,Quarantine,Isolation,Confirmed Today,
 * Recovered Today,Deaths Today,created_at,updated_at
 *
 * @param   {Object}  data  original data
 *
 * @return  {Object}        normalized data
 */
const normalizeOverviewData = (data) => ({
  date: getCurrDate(),
  confirmed: data.positive,
  recovered: data.extra1,
  deaths: data.deaths,
  quarantine: data.extra8,
  isolation: data.extra2,
  today_confirmed: data.today_newcase,
  today_recovered: data.today_recovered,
  today_deaths: data.today_death,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

/**
 * Returns a normalized testing data object for the following CSV headers:
 * Date,PCR,PCR Positive,PCR Negative,PCR Today,RDT,RDT Today,created_at,updated_at
 *
 * @param   {Object}  data  original data
 *
 * @return  {Object}        normalized data
 */
const normalizeTestingData = (data) => ({
  date: getCurrDate(),
  pcr: data.samples_tested,
  pcr_positive: data.positive,
  pcr_negative: data.negative,
  pcr_today: data.today_pcr,
  rdt: data.extra7,
  rdt_today: data.today_rdt,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

/**
 * Converts normalized overview JSON data into CSV and appends to the respective
 * CSV file
 *
 * @param   {Object}  normalizedJson  Normalized overview data
 *
 * @return
 */
const appendOverviewCsv = (normalizedJson) => {
  const overviewCsv = parse(normalizedJson, mohpCsvOptions);
  const filepath = path.join(mohpCsvPath, 'overview.csv');
  appendToCsv(overviewCsv, filepath);
};

/**
 * Converts normalized testing JSON data into CSV and appends to the respective
 * CSV file
 *
 * @param   {Object}  normalizedJson  Normalized testing data
 *
 * @return
 */
const appendTestingCsv = (normalizedJson) => {
  const testingCsv = parse(normalizedJson, mohpCsvOptions);
  const filepath = path.join(mohpCsvPath, 'testing.csv');
  appendToCsv(testingCsv, filepath);
};

/**
 * Scrapes MOHP site and adds data to its respective CSV files
 */
const mohpData = async () => {
  try {
    const { data } = await axios.get(
      'https://covid19.mohp.gov.np/covid/api/confirmedcases',
    );
    const { nepal: nepalData } = data;
    const overviewData = normalizeOverviewData(nepalData);
    const testingData = normalizeTestingData(nepalData);
    appendOverviewCsv(overviewData);
    appendTestingCsv(testingData);
  } catch (err) {
    logger.err('Error: Requesting MOHP Data failed!', err);
  }
};

module.exports = mohpData;
