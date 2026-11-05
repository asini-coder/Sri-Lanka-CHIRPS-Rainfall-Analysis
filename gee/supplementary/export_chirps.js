
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

