# 🍓 Raspberry Pi 4 Smart Dashboard

A responsive, high-contrast touchscreen smart dashboard designed for **Raspberry Pi 4 Model B** (with official 7" touchscreen, 800x480 or 1024x600 resolution) running **Raspberry Pi OS** in full-screen Chromium Kiosk mode.

Powered by a unified **Node.js / TypeScript (Fastify)** backend wrapping the **Munich MVG departures API** and the **Open-Meteo API**, paired with a modern **Svelte 5** frontend styled with **Tailwind CSS**.

---

## 📸 Core Features

1. **Centralized Configuration (`config.json`)**:
   - Location & Weather coordinates (Munich default).
   - Multi-station MVG transit preferences with granular line/direction/product filters.
   - Dynamic UI polling and auto-refresh intervals.
2. **Clothing & Weather Advisor**:
   - Automated `wearJacket` and `bringUmbrella` evaluation based on ambient temperature, apparent "feels-like" temperature, rain volume, and near-term precipitation probability.
3. **Touch-Optimized Svelte 5 UI**:
   - **Page 1 (Home)**: Prominent digital clock, live localized date, weather summary with clothing advisor cards, and split upcoming trains / buses.
   - **Page 2 (Full Weather)**: 24-hour horizontal hourly forecast carousel + 14-day weekly trend with min/max temperature ranges and precipitation chances.
   - **Page 3 (Full Transit)**: Departure board split into **"Trains (S-Bahn / U-Bahn)"** and **"Buses / Trams"** with real-time minutes countdown, delays, and official MVG line color branding.
4. **Raspberry Pi Kiosk Ready**:
   - Hardened Chromium kiosk launch script.
   - Mouse cursor auto-hiding with `unclutter`.
   - Screen blanking / DPMS sleeping disabled for continuous 24/7 power operation.
   - Unified systemd service (`rpi-dashboard.service`).

---

## 📂 Project Structure

```
raspberrypi-dashboard/
├── config.json                     # Central configuration (Weather, MVG stations, intervals)
├── package.json                    # Monorepo scripts (build, dev, start)
├── README.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Fastify server entry (static hosting + REST APIs)
│       ├── config/
│       │   └── config.loader.ts    # Config reader with auto-resolution and fallback
│       ├── types/
│       │   ├── config.types.ts     # Configuration typings
│       │   ├── mvg.types.ts        # MVG API schemas & normalized departure types
│       │   └── weather.types.ts    # Open-Meteo & advisor payload types
│       ├── services/
│       │   ├── advisor.service.ts  # Clothing & Weather Advisor (jacket, umbrella logic)
│       │   ├── weather.service.ts  # Open-Meteo API wrapper & WMO code mapper
│       │   └── mvg.service.ts      # MVG transit departures fetcher & normalizer
│       └── routes/
│           ├── config.route.ts     # GET /api/config
│           ├── weather.route.ts    # GET /api/weather
│           └── transit.route.ts    # GET /api/transit
├── frontend/
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── app.css                 # Touchscreen styles & glassmorphism utilities
│       ├── main.ts                 # Svelte 5 mount
│       ├── App.svelte              # Root shell with tab switcher
│       ├── types/
│       │   └── dashboard.types.ts
│       ├── lib/
│       │   ├── api.ts              # API client for backend endpoints
│       │   ├── store.svelte.ts     # Svelte 5 reactive data stores & polling timers
│       │   └── weather-utils.ts    # Date/time & minute formatting helpers
│       └── components/
│           ├── Clock.svelte        # Digital clock with localized date & pulsing seconds
│           ├── Icon.svelte         # Lightweight SVG vector icon library
│           ├── LinePill.svelte     # MVG branded pills with official line colors
│           ├── Navigation.svelte   # Bottom tactile navigation bar (Home, Weather, Transit)
│           ├── WeatherBadge.svelte # Jacket & umbrella status cards with visual cues
│           └── views/
│               ├── HomeView.svelte     # Page 1: General Dashboard
│               ├── WeatherView.svelte  # Page 2: Full Weather (24h hourly + 14-day)
│               └── TransitView.svelte  # Page 3: Full Transit (Trains vs Buses/Trams)
└── deploy/
    ├── setup-kiosk.sh              # Automated Raspberry Pi OS installer script
    ├── rpi-dashboard.service       # Systemd unit file template
    ├── kiosk-x11.sh                # Hardened Chromium launcher for X11 / Openbox
    └── kiosk-wayland.sh            # Hardened Chromium launcher for Wayland / Wayfire
```

---

## ⚙️ Configuration (`config.json`)

Edit `config.json` in the root folder to customize your location and transit stations:

```json
{
  "weather": {
    "city": "München",
    "latitude": 48.137154,
    "longitude": 11.576124,
    "timezone": "Europe/Berlin"
  },
  "transit": {
    "stations": [
      {
        "id": "de:09162:6",
        "name": "Marienplatz",
        "allowedProducts": ["U_BAHN", "S_BAHN", "BUS"],
        "lines": [],
        "directions": []
      },
      {
        "id": "de:09162:2",
        "name": "Sendlinger Tor",
        "allowedProducts": ["U_BAHN", "TRAM", "BUS"],
        "lines": ["U1", "U2", "U3", "U6", "16", "18", "27"],
        "directions": []
      }
    ],
    "maxDeparturesPerStation": 20
  },
  "ui": {
    "weatherPollIntervalMs": 300000,
    "transitPollIntervalMs": 30000,
    "configPollIntervalMs": 600000,
    "theme": "dark",
    "locale": "de-DE",
    "timeFormat": "24h"
  }
}
```

---

## 🛠️ Local Development

### 1. Install all dependencies:
```bash
npm run setup
```

### 2. Run both Backend and Frontend in development mode:
In terminal 1:
```bash
npm run dev:backend
```
In terminal 2:
```bash
npm run dev:frontend
```
Open `http://localhost:5173` in your browser.

---

## 🚀 Raspberry Pi Automated Deployment

On your Raspberry Pi running Raspberry Pi OS (Debian Bullseye or Bookworm):

```bash
# 1. Clone the repository
git clone https://github.com/gabrielmeireles/raspberrypi-dashboard.git
cd raspberrypi-dashboard

# 2. Run the automated kiosk setup script
chmod +x deploy/setup-kiosk.sh
./deploy/setup-kiosk.sh

# 3. Reboot the Raspberry Pi
sudo reboot
```

### What `setup-kiosk.sh` does automatically:
1. Installs `chromium-browser`, `unclutter`, and system utilities.
2. Installs Node.js 20 LTS if missing.
3. Builds the Svelte frontend into static assets and compiles backend TypeScript.
4. Disables screen blanking / DPMS sleep in both X11 and Wayland.
5. Sets up and starts the `systemd` service `rpi-dashboard.service`.
6. Configures desktop autostart so Chromium boots directly into `http://localhost:3000` in full-screen kiosk mode with cursor hidden.

---

## 🔧 Service Management

- Check backend logs:
  ```bash
  journalctl -u rpi-dashboard -f
  ```
- Restart dashboard backend:
  ```bash
  sudo systemctl restart rpi-dashboard
  ```