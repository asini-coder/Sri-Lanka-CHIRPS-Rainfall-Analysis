
 // Copernicus Terrain Analysis — Six Sri Lankan Stations

var stationData = [
  ['Badulla', 81.05, 6.98],
  ['Colombo', 79.87, 6.90],
  ['Galle', 80.22, 6.03],
  ['Kandy', 80.63, 7.33],
  ['Nuwara Eliya', 80.77, 6.97],
  ['Puttalam', 79.83, 8.03]
];

var stations = ee.FeatureCollection(stationData.map(function(s) {
  return ee.Feature(ee.Geometry.Point([s[1], s[2]]), {
    Station: s[0]
  });
}));

// Load Copernicus GLO-30 elevation data
var demCollection = ee.ImageCollection('COPERNICUS/DEM/GLO30');
var dem = demCollection.select('DEM')
  .mosaic()
  .setDefaultProjection(demCollection.first().projection());

var slope = ee.Terrain.slope(dem);

// Calculate statistics for each station
var terrainStats = stations.map(function(station) {
  var point = station.geometry();
  var area = point.buffer(10000);

  var stationElevation = dem.reduceRegion({
    reducer: ee.Reducer.first(),
    geometry: point,
    scale: 30,
    maxPixels: 1e7
  }).get('DEM');

  var stats = dem.reduceRegion({
    reducer: ee.Reducer.mean().combine({
      reducer2: ee.Reducer.stdDev(),
      sharedInputs: true
    }),
    geometry: area,
    scale: 90,
    maxPixels: 1e7
  });

  var meanSlope = slope.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: area,
    scale: 90,
    maxPixels: 1e7
  }).get('slope');

  return ee.Feature(null, {
    Station: station.get('Station'),
    DEM_Elevation_m: stationElevation,
    Mean_Elevation_10km_m: stats.get('DEM_mean'),
    Elevation_SD_10km_m: stats.get('DEM_stdDev'),
    Mean_Slope_10km_deg: meanSlope
  });
});

print('Number of stations:', stations.size());
print('Terrain statistics:', terrainStats);

Map.centerObject(stations, 8);
Map.addLayer(stations, {color: 'red'}, 'Stations');

// Export terrain data
Export.table.toDrive({
  collection: terrainStats,
  description: 'Six_Stations_Copernicus_Terrain',
  folder: 'Copernicus Data',
  fileNamePrefix: 'Six_Stations_Copernicus_Terrain',
  fileFormat: 'CSV',
  selectors: [
    'Station',
    'DEM_Elevation_m',
    'Mean_Elevation_10km_m',
    'Elevation_SD_10km_m',
    'Mean_Slope_10km_deg'
  ]
});

