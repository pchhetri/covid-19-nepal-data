const _ = require('lodash');
const path = require('path');
const { parse } = require('json2csv');

const { addDate, appendToCsv } = require('../utils/utils');
const districts = require('../../metadata/districts.json');
const provinces = require('../../metadata/provinces.json');

/**
 * The root path where the Kathmandu Post CSV files are located
 *
 * @var {String}
 */
const kathmanduPostCsvPath = path.join(
  path.dirname(require.main.filename),
  '..',
  'data',
  'kathmandu-post',
);

/**
 * CSV fields to extract from the JSON object for the json2csv parser
 *
 * @var {Object}
 */
const districtCsvFields = [
  'date',
  'province',
  'name',
  'total',
  'deaths',
  'recovered',
  'readmitted',
];

/**
 * CSV options for the json2csv parser
 *
 * @var {Object}
 */
const districtCsvOptions = {
  fields: districtCsvFields,
  header: false,
  quote: '',
};

/**
 * Returns a normalized overview data object for the following CSV headers:
 * Date, Province, District, Confirmed, Deaths, Recovered, Readmitted
 *
 * @param   {[type]}  rawJson  original JSON
 *
 * @return  {Object}        normalized data
 */
function normalizeJson(rawJson) {
  // Convert object of objects into array of objects
  const districtDataArr = Object.values(rawJson);
  const mapped = districtDataArr.map(addDistrictProvince).map(addDate);
  const sorted = _.sortBy(mapped, ['province_number', 'name']);
  return sorted;
}

/**
 * Normalizes district name and adds the respective province
 *
 * @param   {Object}  item  District object from Kathmandu Post
 *
 * @return  {Object}        Modified object with normalized name and province
 */
function addDistrictProvince(item) {
  /* eslint-disable no-param-reassign */
  _.forEach(districts, (d) => {
    if (
      _.toLower(d.name) === _.toLower(item.name) ||
      _.includes(_.map(d.alternate_names, _.toLower), _.toLower(item.name))
    ) {
      const province = _.find(provinces, {
        number: d.province_number,
      });
      item.name = d.name;
      item.province = province.name;
      return false;
    }
    return true;
  });
  return item;
  /* eslint-enable no-param-reassign */
}

/**
 * Converts normalized district JSON data into CSV and appends to the respective
 * CSV file
 *
 * @param   {Object}  normalizedJson  Normalized overview data
 *
 * @return
 */
function appendDistrictAggregateCsv(normalizedJson) {
  const aggregateCsv = parse(normalizedJson, districtCsvOptions);
  const filepath = path.join(kathmanduPostCsvPath, 'districts-aggregated.csv');
  appendToCsv(aggregateCsv, filepath);
}

/**
 * Converts normalized district JSON data into CSV and appends to each respective
 * distinct CSV file
 *
 * @param   {Object}  normalizedJson  Normalized overview data
 *
 * @return
 */
function appendDistinctDistrictCsv(normalizedJson) {
  _.each(normalizedJson, (districtData) => {
    const distinctCsv = parse(districtData, districtCsvOptions);
    const normalizedDistrictName = distinctCsv.split(',')[2].replace(/"/g, '');
    const filename = `${normalizedDistrictName
      .toLocaleLowerCase()
      .replace(/ /g, '-')}.csv`;
    const filepath = path.join(kathmanduPostCsvPath, 'districts', filename);
    appendToCsv(distinctCsv, filepath);
  });
}

/**
 * Converts the provided JSON object:
 *
 * {
 *   rauthat: {
 *     code: 'rauthat',
 *     name: 'Rautahat',
 *     total: '1428',
 *     deaths: '1',
 *     recovered: '370',
 *     readmitted: '1'
 *   }
 *   ...
 * }
 *
 * into CSV format and appends it to the respective CSV file
 *
 * Date,Confirmed,Active,Deaths,Recovered,Readmitted
 * 2020-07-07,16168,12481,35,3652,4
 *
 * Date,Province,District,Confirmed,Deaths,Recovered,Readmitted
 * 2020-07-07,Province 1,Bhojpur,6,0,6,0
 *
 * @param   {Object}  json  raw JSON
 *
 * @return
 */
function appendDataToCsv(json) {
  const normalizedJson = normalizeJson(json);
  appendDistrictAggregateCsv(normalizedJson);
  appendDistinctDistrictCsv(normalizedJson);
}

module.exports = {
  appendDataToCsv,
};
