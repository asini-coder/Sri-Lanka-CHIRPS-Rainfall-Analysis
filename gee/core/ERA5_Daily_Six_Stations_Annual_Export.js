
/*
 Sri Lanka Rainfall Research
 Phase 3 — Atmospheric Physics

 ERA5 DAILY Annual Extraction
 Test year: 1981
 Six Sri Lankan rainfall stations

 Daily mean variables:
 U10_ms              (m/s)
 V10_ms              (m/s)
 Temperature_K       (K)
 Dewpoint_K          (K)
 Surface_Pressure_Pa  (Pa)

 Daily dates are UTC.
*/

// =======================================
// 1. SELECT YEAR
// =======================================

var YEAR = 1981;

var startDate = ee.Date.fromYMD(YEAR, 1, 1);
var endDate = startDate.advance(1, 'year');

// =======================================
// 2. SIX STATIONS
// =======================================

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

// =======================================
// 3. LOAD DAILY ERA5
// =======================================

var era5 = ee.ImageCollection(
  'ECMWF/ERA5/DAILY'
)
.filterDate(startDate, endDate)
.select(
  [
    'u_component_of_wind_10m',
    'v_component_of_wind_10m',
    'mean_2m_air_temperature',
    'dewpoint_2m_temperature',
    'surface_pressure'
  ],
  [
    'U10_ms',
    'V10_ms',
    'Temperature_K',
    'Dewpoint_K',
    'Surface_Pressure_Pa'
  ]
);

// =======================================
// 4. CHECK DATA
// =======================================

print('Selected year:', YEAR);
print('Number of stations:', stations.size());
print('Daily ERA5 images:', era5.size());

// =======================================
// 5. ASSIGN DATE IDENTIFIERS
// =======================================

var datedERA5 = era5.map(function(image) {

  var dateID = image.date().format('YYYYMMdd');

  return image.set('system:index', dateID);

});

// =======================================
// 6. STACK DAILY VARIABLES
// =======================================

var stacked = datedERA5.toBands();

print(
  'Number of stacked bands:',
  stacked.bandNames().size()
);

print(
  'First band names:',
  stacked.bandNames().slice(0, 10)
);

// =======================================
// 7. SAMPLE STATIONS ONCE
// =======================================

var sampled = stacked.sampleRegions({

  collection: stations,

  properties: ['Station'],

  scale: 27830,

  geometries: false,

  tileScale: 4

});

// Avoid expensive Console queries:
// sampled.size() or sampled.limit()
// may cause computation-limit errors.

// =======================================
// 8. DISPLAY LOCATIONS
// =======================================

Map.centerObject(stations, 8);

Map.addLayer(
  stations,
  {color: 'red'},
  'Six Rainfall Stations'
);

// =======================================
// 9. EXPORT ANNUAL CSV
// =======================================

Export.table.toDrive({

  collection: sampled,

  description:
    'ERA5_Atmosphere_' + YEAR,

  folder: 'ERA5 Data',

  fileNamePrefix:
    'ERA5_Six_Stations_' + YEAR + '_Wide',

  fileFormat: 'CSV'

});

print('Annual export prepared:', YEAR);
