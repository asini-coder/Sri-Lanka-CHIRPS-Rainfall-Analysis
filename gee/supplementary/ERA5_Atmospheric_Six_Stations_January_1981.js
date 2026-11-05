
/*
 Sri Lanka Rainfall Research
 Phase 3 — Atmospheric Physics

 ERA5 January 1981 test
 Efficient extraction using one multiband image

 Four variables:
 U10_ms         : eastward wind (m/s)
 V10_ms         : northward wind (m/s)
 Temperature_K  : temperature (K)
 Dewpoint_K     : dew-point temperature (K)

 Daily averaging uses UTC days.
*/

// ==========================================
// 1. Six station locations
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
// 2. Date range
// ==========================================

var startDate = ee.Date('1981-01-01');
var endDate = ee.Date('1981-02-01');

// ==========================================
// 3. Load ERA5 hourly data
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
    'dewpoint_temperature_2m'
  ],
  [
    'U10_ms',
    'V10_ms',
    'Temperature_K',
    'Dewpoint_K'
  ]
);

print('Hourly ERA5 images:', era5.size());

// ==========================================
// 4. Create daily mean images
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

    // Stable daily identifier
    var dateID = day.format('YYYYMMdd');

    return dailyMean
      .set('system:index', dateID)
      .set('system:time_start', day.millis());

  })

);

print('Daily images:', dailyImages.size());

// ==========================================
// 5. Stack days into one image
// ==========================================

var stackedImage = dailyImages.toBands();

print(
  'Total stacked bands:',
  stackedImage.bandNames().size()
);

print(
  'First band names:',
  stackedImage.bandNames().slice(0, 8)
);

// ==========================================
// 6. Sample all six stations ONCE
// ==========================================

var sampled = stackedImage.sampleRegions({

  collection: stations,

  properties: ['Station'],

  scale: 27830,

  geometries: false

});

// Avoid printing sampled.size() or
// sampled.limit(), which may force
// expensive interactive calculations.

// ==========================================
// 7. Display station locations
// ==========================================

Map.centerObject(stations, 8);

Map.addLayer(
  stations,
  {color: 'red'},
  'Rainfall Stations'
);

// ==========================================
// 8. Export the wide CSV
// ==========================================

Export.table.toDrive({

  collection: sampled,

  description:
    'ERA5_January_1981_Wide',

  folder: 'ERA5 Data',

  fileNamePrefix:
    'ERA5_Six_Stations_January_1981_Wide',

  fileFormat: 'CSV'

});

print('Export task prepared.');
