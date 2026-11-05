# CHIRPS Rainfall Validation and Calibration — Sri Lanka

**PH3043 Undergraduate Capstone Project** · Research period **1981–2000** · Six meteorological stations.

## Overview
This project investigates the correspondence between gauge rainfall and CHIRPS v2/v3 RNL estimates, temporal aggregation, spatial extraction sensitivity, and statistical/physics-informed calibration. **Final model selection is station- and scale-specific**, based on development-period validation. The 1995–2000 period is reported as a **historical exploratory evaluation**, because it had been explored previously, not as a pristine external holdout.

## Start here
1. Read [`docs/REPRODUCIBILITY.md`](docs/REPRODUCIBILITY.md) and [`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md).
2. Install dependencies with `pip install -r requirements.txt` in a fresh virtual environment.
3. Obtain any restricted gauge observations through permitted channels; see `data/README.md`.
4. Run notebooks in `notebooks/final/` in order **01 → 06**. The notebooks are **preserved unchanged** and may refer to the source project's original relative paths and output directories; use the same working-directory layout for a full rerun.
5. For quick review without rerunning, examine summarized results under `results/Final_06_Station_Selection/run_001/`.
6. For visualization, see `notebooks/visualization/Final_06_With_Station_Visualisation.ipynb` (a supplied copy; retained unchanged).

## Main notebooks
| Notebook | Purpose |
|---|---|
| Final 01 | Gauge quality control and baseline CHIRPS validation |
| Final 02 | V2/V3, temporal and spatial diagnostics |
| Final 03 | Daily calibration and rolling validation |
| Final 04 | Pentad/monthly calibration and statistical diagnostics |
| Final 05 | Physics-informed predictors and model comparison |
| Final 06 | Station/scale-specific model selection and historical evaluation |

`notebooks/exploratory/` contains selected earlier diagnostic and cleaning workflows, not mandatory additional steps. Other experiments are retained in the *private submission package* where appropriate.

## Key findings
- Pentad-scale station-specific calibration produced relatively consistent historical RMSE reductions at several stations.
- Monthly raw CHIRPS v3 was selected at most stations.
- Daily RMSE improvements did not imply better wet-day detection or heavy-rainfall performance.
- Results are contingent on specific stations, dates, and validation design. Consult the original CSVs and notebook outputs; do not interpret correlation as percent accuracy.

## Earth Engine
Prioritized scripts are in `gee/core/`, with diagnostics in `gee/supplementary/`. The scripts are **original unmodified files**. Some require adjusting `YEAR`, `VERSION`, Google Drive export folder, and Earth Engine access before execution. Follow [`docs/GEE_EXTRACTION.md`](docs/GEE_EXTRACTION.md). An extensionless ERA5 script remains extensionless to preserve its original name.

## Data publication and permissions
**This GitHub-ready version intentionally excludes all raw station gauge records, combined gauge-derived daily CSVs, and record-level predictions**, because redistribution permission has not been verified. The complete lecturer/submission package retains the provided files for controlled sharing, subject to authorization. Download the public-source rainfall datasets from their original providers, and arrange access to station observations separately. This repository does **not** claim full independent end-to-end rerun without those inputs.

## Citation, links, and manuscript
See `docs/REFERENCES_AND_LINKS.md`; existing source notebooks, scripts, and report PDF are unmodified. The real repository URL has not yet been assigned. The report is included for review; confirm the latest accepted PDF prior to submission.

## Licensing
No software licence has been selected on behalf of the author. Source reuse rights, gauge-data permissions, and rights to third-party images must be checked before publication.
