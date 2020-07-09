const path = require('path');
const { parse } = require('json2csv');

const { addDate, appendToCsv } = require('../utils/utils');

/**
 * Returns a normalized overview data object for the following CSV headers:
 * Date,Confirmed,Active,Deaths,Recovered,Readmitted
 *
 * @param   {[type]}  rawJson  original JSON
 *
 * @return  {Object}        normalized data
 */
function normalizeJson(rawJson) {
  const mapped = [rawJson].map(addDate);
  return mapped;
}

/**
 * Converts normalized overview JSON data into CSV and appends to the respective
 * CSV file
 *
 * @param   {Object}  normalizedJson  Normalized overview data
 *
 * @return
 */
function appendOverviewCsv(normalizedJson) {
  const overviewCsvFields = [
    'date',
    'confirmed',
    'active',
    'recovered',
    'readmitted',
  ];
  const overviewCsvOptions = {
    fields: overviewCsvFields,
    header: false,
    quote: '',
  };
  const kathmanduPostCsvPath = path.join(
    path.dirname(require.main.filename),
    '..',
    'data',
    'kathmandu-post',
  );
  const overviewCsv = parse(normalizedJson, overviewCsvOptions);
  const filepath = path.join(kathmanduPostCsvPath, 'overview.csv');
  appendToCsv(overviewCsv, filepath);
}

/**
 * Converts the provided JSON object:
 *
 * {
 *   confirmed: '16531',
 *   active: '12844',
 *   deaths: '35',
 *   recovered: '3652',
 *   readmitted: '4'
 * }
 *
 * into CSV format and appends it to the respective CSV file
 *
 * 2020-07-07,16531,12844,35,3652,4
 *
 * @param   {Object}  json  raw JSON
 *
 * @return
 */
function appendDataToCsv(json) {
  const normalizedJson = normalizeJson(json);
  appendOverviewCsv(normalizedJson);
}

module.exports = {
  appendDataToCsv,
};
