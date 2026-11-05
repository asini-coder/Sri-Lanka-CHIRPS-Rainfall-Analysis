# Reproduction instructions and known limitations

1. Use Python 3 and install `requirements.txt`. The requirements are **inferred from notebook imports**, not a tested locked environment; capture package versions when the final environment is validated.
2. Place `data/` at the project root, including `ground/`, `chirps/`, `era5/`, `copernicus/`, `enso/`, `processed/` as in the original source ZIP. On a public checkout, these must be provided separately if permitted.
3. Launch Jupyter with the project root as the working directory; run `notebooks/final/Final_01_...` through `Final_06_...` sequentially. Some notebooks may expect `../data` relative to their original folder; if so launch from the proper directory and **make documented working copies** rather than silently editing original notebooks.
4. The original final notebooks remain unedited; automatically generated outputs under `results/` are **examples from the supplied executed workflow**, not guarantees that a fresh rerun will be bitwise identical.
5. Results selected via rolling/expanding development validation; refit before the 1995–2000 evaluation. This latter period was previously explored, and cannot be represented as an untouched independent holdout.
6. Use a complete calendar window for pentad/monthly aggregation; exclude incomplete valid-day intervals. Check gauge missing-data conventions and avoid replacing missing values with zero.
7. Verification: compare `results/Final_06_Station_Selection/run_001/tables/08_final_station_scale_recommendations.csv` against rerun station/scale selections and `09_historical_test_metrics.csv` against aggregated metrics.

## Scope of release
The public repository is a code + summary-results release, not a full-data public mirror. The private instructor archive holds the original data and all uploaded results, and must only be shared with suitable permissions.
