
/*
 Sri Lanka Rainfall Research
 Phase 3 — Step 3.19

 MULTISCALE TERRAIN GRADIENT ANALYSIS

 Dataset: Copernicus DEM GLO-30
 Stations: Six Sri Lankan rainfall stations

 Terrain neighbourhood widths:
 5 km  (2.5 km radius)
 10 km (5 km radius)

 Processing grid: 250 m, UTM Zone 44N

 Outputs:
 Station
 dhdx_5km
 dhdy_5km
 dhdx_10km
 dhdy_10km
 Slope_5km_deg
 Slope_10km_deg
*/

// ======================================
// 1. DEFINE STATIONS
// ======================================

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

// ======================================
// 2. LOAD COPERNICUS DEM
// ======================================

var demCollection = ee.ImageCollection(
  'COPERNICUS/DEM/GLO30'
).select('DEM');

var nativeProjection = ee.Image(
  demCollection.first()
).projection();

var dem = demCollection
  .mosaic()
  .setDefaultProjection(nativeProjection)
  .rename('Elevation_m');

// ======================================
// 3. CREATE 250 m WORKING GRID
// ======================================

// UTM Zone 44N covers the six stations.
// Using 250 m reduces the computational
// cost of large neighbourhood smoothing.

var workingProjection = ee.Projection(
  'EPSG:32644'
).atScale(250);

var dem250 = dem.reduceResolution({
  reducer: ee.Reducer.mean(),
  maxPixels: 1024
}).reproject(workingProjection);

print('Working projection:', workingProjection);

// ======================================
// 4. SMOOTH TERRAIN AT TWO SCALES
// ======================================

// 5 km diameter neighbourhood
var dem5km = dem250.focalMean({
  radius: 2500,
  kernelType: 'circle',
  units: 'meters'
}).rename('DEM_5km');

// 10 km diameter neighbourhood
var dem10km = dem250.focalMean({
  radius: 5000,
  kernelType: 'circle',
  units: 'meters'
}).rename('DEM_10km');

// ======================================
// 5. COMPUTE TERRAIN GRADIENTS
// ======================================

function calculateGradients(image, suffix) {

  var terrain = ee.Terrain.products(image);

  var slope = terrain.select('slope')
    .rename('Slope_' + suffix + '_deg');

  var aspect = terrain.select('aspect');

  var slopeRadians = slope.multiply(
    Math.PI / 180
  );

  var aspectRadians = aspect.multiply(
    Math.PI / 180
  );

  // Aspect is downslope direction.
  // Reverse direction for positive
  // elevation gradients.

  var magnitude = slopeRadians.tan();

  var dhdx = magnitude
    .multiply(aspectRadians.sin())
    .multiply(-1)
    .rename('dhdx_' + suffix);

  var dhdy = magnitude
    .multiply(aspectRadians.cos())
    .multiply(-1)
    .rename('dhdy_' + suffix);

  return slope
    .addBands(dhdx)
    .addBands(dhdy);
}

// ======================================
// 6. BUILD MULTISCALE TERRAIN IMAGE
// ======================================

var gradient5km = calculateGradients(
  dem5km, '5km'
);

var gradient10km = calculateGradients(
  dem10km, '10km'
);

var multiscaleTerrain = gradient5km
  .addBands(gradient10km);

// ======================================
// 7. EXTRACT VALUES FOR SIX STATIONS
// ======================================

var terrainResults = multiscaleTerrain
  .reduceRegions({
    collection: stations,
    reducer: ee.Reducer.first(),
    crs: workingProjection,
    scale: 250,
    tileScale: 4
  });

print('Number of stations:', stations.size());

// Avoid requesting a large visual
// DEM evaluation in the Console.

// ======================================
// 8. DISPLAY STATIONS
// ======================================

Map.centerObject(stations, 8);

Map.addLayer(
  stations,
  {color: 'red'},
  'Six Rainfall Stations'
);

// ======================================
// 9. EXPORT RESULTS
// ======================================

Export.table.toDrive({

  collection: terrainResults,

  description:
    'Six_Stations_Multiscale_Terrain',

  folder: 'Copernicus Data',

  fileNamePrefix:
    'Six_Stations_Multiscale_Terrain',

  fileFormat: 'CSV',

  selectors: [
    'Station',
    'Slope_5km_deg',
    'dhdx_5km',
    'dhdy_5km',
    'Slope_10km_deg',
    'dhdx_10km',
    'dhdy_10km'
  ]

});

print('Multiscale terrain export prepared.');
