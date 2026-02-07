# Now or Nah

A tiny crowd-sourced decision helper for places like cafés, restaurants, and malls.

## Features
- Pick a place from a dropdown.
- One-tap updates for:
  - Open status (`🟢 Open`, `🟡 Closing soon`, `🔴 Closed`)
  - Noise level (`🤫 Quiet`, `😐 Moderate`, `📢 Noisy`)
  - Crowd level (`🟢 Empty`, `🟡 Moderate`, `🔴 Packed`)
- Majority vote determines the current shown status for each signal.
- Vote counts + last updated timestamp shown live.
- Data is persisted with `localStorage`.

## Run locally
```bash
python3 -m http.server 4173
```
Then open <http://localhost:4173>.
