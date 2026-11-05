
// Sri Lanka CHIRPS Calibration Project
// Step 4.2: Display the six selected rainfall stations

var stations = ee.FeatureCollection(
    {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          81.05,
          6.98
        ]
      },
      "properties": {
        "Station": "Badulla",
        "Elevation_m": 669.6
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          79.87,
          6.9
        ]
      },
      "properties": {
        "Station": "Colombo",
        "Elevation_m": 7.3
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          80.22,
          6.03
        ]
      },
      "properties": {
        "Station": "Galle",
        "Elevation_m": 12.5
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          80.63,
          7.33
        ]
      },
      "properties": {
        "Station": "Kandy",
        "Elevation_m": 477.0
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          80.77,
          6.97
        ]
      },
      "properties": {
        "Station": "Nuwara Eliya",
        "Elevation_m": 1894.6
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          79.83,
          8.03
        ]
      },
      "properties": {
        "Station": "Puttalam",
        "Elevation_m": 2.1
      }
    }
  ]
}
);

Map.centerObject(stations, 8);

Map.addLayer(
    stations,
    {color: 'red'},
    'Rainfall stations'
);

print('Number of stations:', stations.size());
print('Station locations:', stations);

// Step 4.3: Test daily CHIRPS extraction
// Period: October 1990
// Stations: All six

// 1. Load CHIRPS daily rainfall
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filterDate('1990-10-01', '1990-11-01')
  .select('precipitation');

// 2. Extract rainfall at each station
var dailyRainfall = chirps.map(function(image) {

  var date = image.date().format('YYYY-MM-dd');

  var extracted = image.reduceRegions({
    collection: stations,
    reducer: ee.Reducer.first(),
    scale: 5566
  });

  return extracted.map(function(feature) {
    return feature.set({
      'Date': date,
      'CHIRPS_mm': feature.get('first')
    });
  });

}).flatten();

// 3. Check the results
print('Number of CHIRPS images:', chirps.size());
print('Number of station-day records:', dailyRainfall.size());
print('Sample CHIRPS data:', dailyRainfall.limit(10));


//
// Step 4.4 — Full CHIRPS extraction
// All six stations, 1981–2000
//

var chirpsFull = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filterDate('1981-01-01', '2001-01-01')
  .select('precipitation');

var fullDailyRainfall = chirpsFull.map(function(image) {

  var extracted = image.reduceRegions({
    collection: stations,
    reducer: ee.Reducer.first(),
    scale: 5566
  });

  var date = image.date().format('YYYY-MM-dd');

  return extracted.map(function(feature) {
    return ee.Feature(null, {
      'Date': date,
      'Station': feature.get('Station'),
      'CHIRPS_mm': feature.get('first')
    });
  });

}).flatten();

print('Full CHIRPS image count:', chirpsFull.size());

// Export as CSV to Google Drive
Export.table.toDrive({
  collection: fullDailyRainfall,
  description: 'SriLanka_CHIRPS_1981_2000',
  folder: 'CHIRPS Data',
  fileNamePrefix: 'Six_Stations_CHIRPS_Daily_1981_2000',
  fileFormat: 'CSV',
  selectors: ['Date', 'Station', 'CHIRPS_mm']
});

