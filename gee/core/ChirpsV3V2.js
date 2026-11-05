
/*
 Sri Lanka Rainfall Research — Phase 2
 CHIRPS v3 Daily Reanalysis (RNL)
 Period: 1981–2000
 Six rainfall stations
 Units: mm/day
*/

// 1. Define six rainfall stations

var stations = ee.FeatureCollection([
  ee.Feature(
    ee.Geometry.Point([81.05, 6.98]),
    {Station: 'Badulla'}
  ),
  ee.Feature(
    ee.Geometry.Point([79.87, 6.90]),
    {Station: 'Colombo'}
  ),
  ee.Feature(
    ee.Geometry.Point([80.22, 6.03]),
    {Station: 'Galle'}
  ),
  ee.Feature(
    ee.Geometry.Point([80.63, 7.33]),
    {Station: 'Kandy'}
  ),
  ee.Feature(
    ee.Geometry.Point([80.77, 6.97]),
    {Station: 'Nuwaraeliya'}
  ),
  ee.Feature(
    ee.Geometry.Point([79.83, 8.03]),
    {Station: 'Puttalam'}
  )
]);

// 2. Define historical period

var startDate = '1981-01-01';
var endDate = '2001-01-01'; // Exclusive

// 3. Load CHIRPS v3 RNL dataset

var chirpsV3 = ee.ImageCollection(
  'UCSB-CHC/CHIRPS/V3/DAILY_RNL'
)
.filterDate(startDate, endDate)
.select('precipitation');

// 4. Verify image collection

print('Number of stations:', stations.size());

print(
  'Number of CHIRPS v3 images:',
  chirpsV3.size()
);

print(
  'Available bands:',
  ee.Image(chirpsV3.first()).bandNames()
);

// 5. Extract daily rainfall

var dailyRainfall = chirpsV3.map(function(image) {

  var date = image.date().format('YYYY-MM-dd');

  var extracted = image.reduceRegions({
    collection: stations,
    reducer: ee.Reducer.first(),
    scale: 5566
  });

  return extracted.map(function(feature) {

    return ee.Feature(null, {
      Date: date,
      Station: feature.get('Station'),
      CHIRPS_V3_mm: feature.get('first')
    });

  });

}).flatten();

// 6. Print small sample

print(
  'Sample extracted records:',
  dailyRainfall.limit(12)
);

// 7. Display station locations

Map.centerObject(stations, 8);

Map.addLayer(
  stations,
  {color: 'red'},
  'Six Rainfall Stations'
);

// 8. Export full dataset to Google Drive

Export.table.toDrive({
  collection: dailyRainfall,
  description: 'SriLanka_CHIRPS_V3_RNL_1981_2000',
  folder: 'CHIRPS Data',
  fileNamePrefix: 'Six_Stations_CHIRPS_V3_Daily_1981_2000',
  fileFormat: 'CSV',
  selectors: [
    'Date',
    'Station',
    'CHIRPS_V3_mm'
  ]
});
