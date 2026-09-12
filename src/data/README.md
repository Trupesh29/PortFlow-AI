# Data Module — PortFlow AI

Contains synthetic dataset generators, raw CSVs, and processed datasets for training and demonstration.

Generate all five reproducible scenarios from `src/` with
`python -m data.generate_synthetic`. Output is fictional and synthetic only:
one terminal, 3 berths, 7 cranes, 15 vessels, 36 calls, and 36 historical
operations per scenario.

- `raw/`: Raw synthetic generation outputs or imported CSV schedules.
- `processed/`: Formatted feature matrices ready for ML training.
- `sample/`: Pre-packaged sample scenarios used for the 2–3 minute demo journey.

> **Note:** All operational data in this project is synthetic and seed-driven.
