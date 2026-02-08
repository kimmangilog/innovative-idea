# Go, Eat, or Skip

A lightweight single-page app that helps students quickly decide whether they should go to a food place right now.

## What it does

Each nearby place is scored across 5 dimensions:

1. Place status (open/closing/closed, crowd, noise)
2. Food availability + price
3. Nutrition fit (calories/protein/health tag)
4. Student constraints (budget, walk time, time between classes, preference)
5. Final decision signal: **GO & EAT**, **ONLY IF DESPERATE**, or **SKIP**

## Run locally

```bash
python3 -m http.server 4173
```

Then open: <http://localhost:4173>
