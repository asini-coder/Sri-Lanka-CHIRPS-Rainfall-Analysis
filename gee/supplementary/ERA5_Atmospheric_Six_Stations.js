
/*
 Phase 3: ERA5 Atmospheric Physics
 Initial dataset check — January 1981
*/

var era5 = ee.ImageCollection(
  'ECMWF/ERA5/HOURLY_PRESSURE_LEVELS'
)
.filterDate('1981-01-01', '1981-02-01')
.select([
  'u_component_of_wind_850hPa',
  'v_component_of_wind_850hPa',
  'specific_humidity_850hPa',
  'temperature_850hPa'
]);

print('ERA5 hourly images:', era5.size());
print('Available bands:', ee.Image(era5.first()).bandNames());
print('First image:', era5.first());
