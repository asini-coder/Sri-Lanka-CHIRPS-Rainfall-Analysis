# Methodology summary

- Six stations: Badulla, Colombo, Galle, Kandy, Nuwara Eliya, Puttalam.
- Match observations and satellite estimates by station and date with missing/invalid rainfall excluded.
- Assess CHIRPS v2/v3 RNL, sampling points and spatial buffers where supported by the dataset.
- Generate daily, complete calendar-pentad and complete monthly totals.
- Candidate models include uncalibrated CHIRPS, linear/multiplicative corrections, seasonal Ridge and atmospheric/terrain-informed variants.
- Use development-period rolling/expanding validation, station- and scale-specific near-tie selection, then historical 1995–2000 assessment. Never choose final model using historical test results.
- Report RMSE, MAE, bias, Pearson correlation; for daily wet-day detection report POD/FAR/CSI; for heavy gauge rainfall report heavy-day RMSE.

**Interpretation:** rainfall grid cells represent spatial estimates, not co-located point gauge observations. A smaller numerical RMSE does not automatically imply better detection of rain events or extremes.

Read original notebooks for exact thresholds, folds and predictor definitions; this document is a navigation aid, not an independently verified implementation specification.
