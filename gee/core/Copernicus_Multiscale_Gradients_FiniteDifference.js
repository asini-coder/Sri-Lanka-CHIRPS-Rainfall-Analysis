
/*
 Sri Lanka Rainfall Research
 Phase 3 — Step 3.20

 Corrected multiscale directional terrain gradients

 Copernicus DEM GLO-30
 5 km and 10 km smoothing neighbourhoods
 250 m computational grid

 Uses finite differences rather than
 converting slope and aspect.

 Outputs six station records.
*/

// =====================================
// 1. STATION LOCATIONS
// =====================================

var stations = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([81.05, 6.98]),
    {Station: 'Badulla'}),
  ee.Feature(ee.Geometry.Point([79.87, 6.90]),
    {Station: 'Colombo'}),
  ee.Feature(ee.Geometry.Point([80.22, 6.03]),
    {Station: 'Galle'}),
  ee.Feature(ee.Geometry.Point([80.63, 7.33]),
    {Station: 'Kandy'}),
  ee.Feature(ee.Geometry.Point([80.77, 6.97]),
    {Station: 'Nuwaraeliya'}),
  ee.Feature(ee.Geometry.Point([79.83, 8.03]),
    {Station: 'Puttalam'})
]);

// =====================================
// 2. LOAD AND MOSAIC THE DEM
// =====================================

var demCollection = ee.ImageCollection(
  'COPERNICUS/DEM/GLO30'
).select('DEM');

var sourceProjection = ee.Image(
  demCollection.first()
).projection();

var dem = demCollection
  .mosaic()
  .setDefaultProjection(sourceProjection)
  .rename('DEM');

// Fixed metric projection.
var grid = ee.Projection('EPSG:32644')
  .atScale(250);

// Reproject for 250 m analysis.
var dem250 = dem
  .resample('bilinear')
  .reproject(grid);

// =====================================
// 3. NEIGHBOURHOOD SMOOTHING
// =====================================

var smooth5 = dem250.focalMean({
  radius: 2500,
  kernelType: 'circle',
  units: 'meters'
}).rename('DEM_5km');

var smooth10 = dem250.focalMean({
  radius: 5000,
  kernelType: 'circle',
  units: 'meters'
}).rename('DEM_10km');

// =====================================
// 4. FINITE DIFFERENCE GRADIENTS
// =====================================

// 250 m pixel spacing.
//
// Eastward derivative:
// (elevation east - elevation west)/500
//
// Northward derivative:
// (elevation north - elevation south)/500
//
// Explicit non-normalized kernels.

var kernelX = ee.Kernel.fixed(
  3, 3,
  [
    [0, 0, 0],
    [-1, 0, 1],
    [0, 0, 0]
  ],
  1, 1, false
);

var kernelY = ee.Kernel.fixed(
  3, 3,
  [
    [0, 1, 0],
    [0, 0, 0],
    [0, -1, 0]
  ],
  1, 1, false
);

function gradients(image, suffix) {

  var x = image.convolve(kernelX)
    .divide(500)
    .rename('dhdx_' + suffix);

  var y = image.convolve(kernelY)
    .divide(500)
    .rename('dhdy_' + suffix);

  var magnitude = x.pow(2)
    .add(y.pow(2))
    .sqrt()
    .rename('Gradient_Magnitude_' + suffix);

  return x.addBands(y).addBands(magnitude);
}

// =====================================
// 5. CALCULATE BOTH SCALES
// =====================================

var gradients5 = gradients(smooth5, '5km');

var gradients10 = gradients(smooth10, '10km');

var output = gradients5
  .addBands(gradients10);

// =====================================
// 6. EXTRACT STATION VALUES
// =====================================

var results = output.reduceRegions({
  collection: stations,
  reducer: ee.Reducer.first(),
  crs: grid,
  scale: 250,
  tileScale: 4
});

// =====================================
// 7. DIAGNOSTIC DISPLAY
// =====================================

print('Expected stations:', stations.size());

print(
  'Gradient image bands:',
  output.bandNames()
);

Map.centerObject(stations, 8);

Map.addLayer(
  stations,
  {color: 'red'},
  'Six stations'
);

// =====================================
// 8. EXPORT
// =====================================

Export.table.toDrive({
  collection: results,

  description:
    'Six_Stations_Multiscale_Gradients_FD',

  folder: 'Copernicus Data',

  fileNamePrefix:
    'Six_Stations_Multiscale_Gradients_FD',

  fileFormat: 'CSV',

  selectors: [
    'Station',
    'dhdx_5km',
    'dhdy_5km',
    'Gradient_Magnitude_5km',
    'dhdx_10km',
    'dhdy_10km',
    'Gradient_Magnitude_10km'
  ]
});

print('Finite-difference export prepared.');
