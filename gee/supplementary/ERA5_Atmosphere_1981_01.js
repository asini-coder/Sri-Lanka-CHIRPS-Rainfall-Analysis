
/*
 Sri Lanka Rainfall Research
 Phase 3 — Atmospheric Physics

 ERA5 Monthly Atmospheric Extraction
 Efficient extraction using one multiband image

 Five variables:
 U10_ms              : eastward wind (m/s)
 V10_ms              : northward wind (m/s)
 Temperature_K       : air temperature (K)
 Dewpoint_K          : dew-point temperature (K)
 Surface_Pressure_Pa  : surface pressure (Pa)

 Daily averaging uses UTC calendar days.
*/

// ==========================================
// 1. SELECT YEAR AND MONTH
// ==========================================

// Change these two values for each extraction
var YEAR = 1981;
var MONTH = 1;

// Automatically generate date range
var startDate = ee.Date.fromYMD(YEAR, MONTH, 1);
var endDate = startDate.advance(1, 'month');

// For export filenames
var monthID = YEAR + '_' + ('0' + MONTH).slice(-2);


// ==========================================
// 2. SIX STATION LOCATIONS
// ==========================================

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


// ==========================================
// 3. LOAD ERA5 HOURLY DATA
// ==========================================

var era5 = ee.ImageCollection(
  'ECMWF/ERA5/HOURLY'
)
.filterDate(startDate, endDate)
.select(
  [
    'u_component_of_wind_10m',
    'v_component_of_wind_10m',
    'temperature_2m',
    'dewpoint_temperature_2m',
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

print('Selected year:', YEAR);
print('Selected month:', MONTH);

print('Number of stations:', stations.size());

print('Hourly ERA5 images:', era5.size());


// ==========================================
// 4. CREATE DAILY MEAN IMAGES
// ==========================================

var numberOfDays = endDate.difference(
  startDate, 'day'
);

var dayNumbers = ee.List.sequence(
  0,
  numberOfDays.subtract(1)
);

var dailyImages = ee.ImageCollection.fromImages(

  dayNumbers.map(function(i) {

    var day = startDate.advance(i, 'day');

    var nextDay = day.advance(1, 'day');

    var dailyMean = era5
      .filterDate(day, nextDay)
      .mean();

    var dateID = day.format('YYYYMMdd');

    return dailyMean
      .set('system:index', dateID)
      .set('system:time_start', day.millis());

  })

);

print('Daily images:', dailyImages.size());


// ==========================================
// 5. STACK DAILY IMAGES
// ==========================================

// One stacked image containing all daily
// atmospheric measurements for the month.

var stackedImage = dailyImages.toBands();

print(
  'Total stacked bands:',
  stackedImage.bandNames().size()
);

print(
  'First band names:',
  stackedImage.bandNames().slice(0, 10)
);


// ==========================================
// 6. SAMPLE ALL SIX STATIONS ONCE
// ==========================================

// This avoids repeated reduceRegions calls
// and concurrent aggregation errors.

var sampled = stackedImage.sampleRegions({

  collection: stations,

  properties: ['Station'],

  scale: 27830,

  geometries: false

});


// ==========================================
// 7. DISPLAY STATIONS
// ==========================================

Map.centerObject(stations, 8);

Map.addLayer(
  stations,
  {color: 'red'},
  'Six Rainfall Stations'
);


// ==========================================
// 8. EXPORT MONTHLY CSV TO GOOGLE DRIVE
// ==========================================

Export.table.toDrive({

  collection: sampled,

  description:
    'ERA5_Atmosphere_' + monthID,

  folder: 'ERA5 Data',

  fileNamePrefix:
    'ERA5_Six_Stations_' + monthID + '_Wide',

  fileFormat: 'CSV'

});

print('ERA5 export task prepared:', monthID);
