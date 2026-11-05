
/*
 Sri Lanka Rainfall Research
 Phase 3 — Directional Terrain Analysis

 Copernicus DEM GLO-30
 Six Sri Lankan rainfall stations

 Outputs:
 - Station elevation
 - Slope (degrees)
 - Aspect (degrees clockwise from north)
 - Eastward terrain gradient (dimensionless)
 - Northward terrain gradient (dimensionless)
*/

// 1. Stations
var stations = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([81.05,6.98]),
    {Station:'Badulla'}),
  ee.Feature(ee.Geometry.Point([79.87,6.90]),
    {Station:'Colombo'}),
  ee.Feature(ee.Geometry.Point([80.22,6.03]),
    {Station:'Galle'}),
  ee.Feature(ee.Geometry.Point([80.63,7.33]),
    {Station:'Kandy'}),
  ee.Feature(ee.Geometry.Point([80.77,6.97]),
    {Station:'Nuwaraeliya'}),
  ee.Feature(ee.Geometry.Point([79.83,8.03]),
    {Station:'Puttalam'})
]);

// 2. Load Copernicus DEM
var demCollection = ee.ImageCollection(
  'COPERNICUS/DEM/GLO30'
);

var nativeProjection = demCollection.first()
  .select('DEM').projection();

var dem = demCollection.select('DEM')
  .mosaic()
  .setDefaultProjection(nativeProjection)
  .rename('Elevation_m');

// 3. Compute slope and aspect
var terrain = ee.Terrain.products(dem);

var slope = terrain.select('slope')
  .rename('Slope_deg');

var aspect = terrain.select('aspect')
  .rename('Aspect_deg');

// 4. Convert slope and aspect into
// terrain gradients.
//
// Aspect represents downslope direction.
// The negative sign converts it into
// the direction of increasing elevation.

var slopeRad = slope.multiply(Math.PI / 180);

var aspectRad = aspect.multiply(Math.PI / 180);

var gradientMagnitude = slopeRad.tan();

var dhdx = gradientMagnitude
  .multiply(aspectRad.sin())
  .multiply(-1)
  .rename('dhdx');

var dhdy = gradientMagnitude
  .multiply(aspectRad.cos())
  .multiply(-1)
  .rename('dhdy');

// 5. Combine terrain variables
var terrainImage = dem
  .addBands(slope)
  .addBands(aspect)
  .addBands(dhdx)
  .addBands(dhdy);

// 6. Sample all stations
var terrainData = terrainImage.sampleRegions({
  collection: stations,
  properties: ['Station'],
  scale: 30,
  geometries: false
});

// 7. Display results
print('Stations:', stations.size());
print('Terrain results:', terrainData);

// 8. Display map
Map.centerObject(stations, 8);

Map.addLayer(
  dem,
  {min:0, max:2500,
   palette:['006837','ffffbf','a50026']},
  'Copernicus Elevation'
);

Map.addLayer(
  stations,
  {color:'blue'},
  'Six Stations'
);

// 9. Export CSV
Export.table.toDrive({
  collection: terrainData,
  description:'Copernicus_Directional_Terrain',
  folder:'Copernicus Data',
  fileNamePrefix:
    'Six_Stations_Directional_Terrain',
  fileFormat:'CSV',
  selectors:[
    'Station',
    'Elevation_m',
    'Slope_deg',
    'Aspect_deg',
    'dhdx',
    'dhdy'
  ]
});
