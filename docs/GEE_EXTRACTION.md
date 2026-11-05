# Google Earth Engine extraction scripts and parameter checklist

The `.js` files are supplied **byte-for-byte from the uploaded project**; this guide does not replace their actual code. Use the [Google Earth Engine Code Editor](https://code.earthengine.google.com/) and sign in with an authorized account.

| Priority | Original script | Purpose / user configuration |
|---|---|---|
| Main | `11_CHIRPS_Buffered_Extraction_GEE_FIXED.js` | CHIRPS v2 or v3 RNL buffered extraction. Its source sets `VERSION='v2'`, `YEAR=1981`, `FOLDER='CHIRPS_Buffer_Study'` by default; change YEAR for each 1981–2000 export and set VERSION explicitly. Confirm intended 0/5/10-km geometries and reducers in code. |
| Main | `04_Export_CHIRPS_1981_2000.js.js` | Earlier CHIRPS extraction; **double `.js.js` retained**. Review scope before running. |
| Main | `ChirpsV3V2.js` | CHIRPS v3 RNL daily extract/comparison setup. |
| Main | `ERA5_Daily_Six_Stations_Annual_Export.js` | Six-station ERA5 daily annual exports; set year and confirm UTC day alignment. |
| Main | `ERA5_Download_All_stations` | Extended ERA5 annual export workflow; original extensionless filename retained. |
| Main | `05_Export_Copernicus_Terrain.js` | Copernicus elevation/terrain extraction. |
| Main | `Copernicus_Multiscale_Gradients_FiniteDifference.js` | Multiscale terrain gradients using finite differences, with 5/10 km smoothing neighbourhoods and a computational grid described as 250 m in comments. |
| Optional | `ERA5_Daily_Hourly_Consistency_Check.js` | Checks hourly-vs-daily ERA5 sampling consistency. |

**Critical checks:** station longitude/latitude order; product collection IDs and band names; whether `scale` is requested sampling scale rather than rainfall resolution; point `first` vs buffered `mean` reducer; 5 km versus 10 km radius; date cutoff and time zone; missing dates; Drive export folder and actual CSV schema. Terrain neighbourhood scale and rainfall buffer radius are not interchangeable.

The source contains more than one experimental extraction variant. Preserve them, do not claim one generated every final CSV without matching file provenance. Extracted annual tables are in the private submission package under `data/`.
