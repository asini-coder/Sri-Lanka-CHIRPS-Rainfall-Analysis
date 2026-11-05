
/*
 ERA5 Daily vs Hourly Consistency Test

 Station: Badulla
 Date: 10 January 1981

 Purpose:
 Compare daily and hourly-derived values
 using identical sampling coordinates,
 projection and scale.
*/

var point = ee.Geometry.Point([81.05, 6.98]);

var start = '1981-01-10';
var end = '1981-01-11';

var bands = [
  'u_component_of_wind_10m',
  'v_component_of_wind_10m',
  'temperature_2m',
  'dewpoint_temperature_2m',
  'surface_pressure'
];

// Load ERA5 hourly
var hourly = ee.ImageCollection(
  'ECMWF/ERA5/HOURLY'
)
.filterDate(start, end)
.select(bands);

var hourlyMean = hourly.mean();

// Load ERA5 daily
var daily = ee.ImageCollection(
  'ECMWF/ERA5/DAILY'
)
.filterDate(start, end)
.select(
  [
    'u_component_of_wind_10m',
    'v_component_of_wind_10m',
    'mean_2m_air_temperature',
    'dewpoint_2m_temperature',
    'surface_pressure'
  ],
  bands
);

var dailyImage = ee.Image(daily.first());

// Inspect source projections
print(
  'Hourly projection:',
  hourlyMean.select(0).projection()
);

print(
  'Daily projection:',
  dailyImage.select(0).projection()
);

// Use identical spatial sampling
var hourlyValues = hourlyMean.reduceRegion({
  reducer: ee.Reducer.first(),
  geometry: point,
  crs: 'EPSG:4326',
  scale: 27830,
  maxPixels: 1000
});

var dailyValues = dailyImage.reduceRegion({
  reducer: ee.Reducer.first(),
  geometry: point,
  crs: 'EPSG:4326',
  scale: 27830,
  maxPixels: 1000
});

print('Hourly images:', hourly.size());
print('Daily images:', daily.size());

print('Hourly-derived values:', hourlyValues);
print('Daily product values:', dailyValues);

// Numerical differences: daily minus hourly
var difference = ee.Dictionary(
  ee.List(bands).iterate(function(band, acc) {
    band = ee.String(band);
    var d = ee.Number(dailyValues.get(band))
      .subtract(ee.Number(hourlyValues.get(band)));
    return ee.Dictionary(acc).set(band, d);
  }, ee.Dictionary({}))
);

print('Daily - Hourly differences:', difference);

Map.centerObject(point, 9);
Map.addLayer(point, {color: 'red'}, 'Badulla');
