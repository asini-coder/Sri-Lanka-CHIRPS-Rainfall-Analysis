
// CHIRPS BUFFERED RAINFALL EXTRACTION
// Six Sri Lankan stations, 1981–2000
// Google Earth Engine JavaScript

// =====================================
// STEP 1 — CHANGE THESE SETTINGS
// =====================================

var VERSION = 'v2';  // 'v2' or 'v3rnl'
var YEAR = 1981;     // Change from 1981 to 2000

var FOLDER = 'CHIRPS_Buffer_Study';

// =====================================
// STEP 2 — STATION COORDINATES
// =====================================

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

// =====================================
// STEP 3 — SELECT CHIRPS DATASET
// =====================================

var datasets = {
  v2: 'UCSB-CHG/CHIRPS/DAILY',
  v3rnl: 'UCSB-CHC/CHIRPS/V3/DAILY_RNL'
};

if (!(VERSION in datasets)) {
  throw new Error('Choose v2 or v3rnl');
}

var start = ee.Date.fromYMD(YEAR, 1, 1);
var end = start.advance(1, 'year');

var daily = ee.ImageCollection(datasets[VERSION])
  .filterDate(start, end)
  .select('precipitation')
  .sort('system:time_start');

print('Dataset:', datasets[VERSION]);
print('Number of daily images:', daily.size());

// =====================================
// STEP 4 — SPATIAL BUFFER EXTRACTION
// =====================================

var SCALE_METRES = 5566;

var output = daily.map(function(img) {

  var date = ee.Date(
    img.get('system:time_start')
  ).format('YYYY-MM-dd');

  return stations.map(function(st) {

    var point = st.geometry();

    // Original pixel at station
    var pointValue = img.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: SCALE_METRES,
      maxPixels: 100000
    }).get('precipitation');

    // Buffer average function
    function bufferedMean(radius) {

      return img.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point.buffer(radius),
        scale: SCALE_METRES,
        maxPixels: 100000
      }).get('precipitation');
    }

    return ee.Feature(null, {

      Date: date,
      Station: st.get('Station'),

      Point_mm: pointValue,

      Buffer5km_mm: bufferedMean(5000),

      Buffer10km_mm: bufferedMean(10000)

    });

  });

}).flatten();

// =====================================
// STEP 5 — CHECK DATA
// =====================================

print('Sample extracted rainfall:', output.limit(6));

print(
  'Expected records:',
  daily.size().multiply(6)
);

// =====================================
// STEP 6 — MAP DISPLAY
// =====================================

Map.centerObject(stations, 8);

Map.addLayer(
  stations,
  {color: 'red'},
  'Rainfall stations'
);

Map.addLayer(
  stations.geometry().buffer(5000),
  {color: 'blue'},
  '5 km buffer'
);

Map.addLayer(
  stations.geometry().buffer(10000),
  {color: 'orange'},
  '10 km buffer',
  false
);

// =====================================
// STEP 7 — EXPORT TO GOOGLE DRIVE
// =====================================

Export.table.toDrive({

  collection: output,

  description:
    'CHIRPS_Buffer_' + VERSION + '_' + YEAR,

  folder: FOLDER,

  fileNamePrefix:
    'CHIRPS_Buffer_' + VERSION + '_' + YEAR,

  fileFormat: 'CSV',

  selectors: [
    'Date',
    'Station',
    'Point_mm',
    'Buffer5km_mm',
    'Buffer10km_mm'
  ]

});
