# Raspberry Pi Setup Guide

This guide walks you through installing and running the Smart Dashboard on a **Raspberry Pi 4 Model B** with the official 7" touchscreen, in full-screen Chromium kiosk mode.

For a quick overview of features and project structure, see [README.md](./README.md).

---

## Hardware Requirements

| Component | Recommendation |
|-----------|----------------|
| Board | Raspberry Pi 4 Model B (2 GB RAM minimum; 4 GB recommended) |
| Display | Official Raspberry Pi 7" Touchscreen (800×480 or 1024×600) |
| Storage | 16 GB+ microSD card (Class 10 / A1 or better) |
| Power | Official 15 W USB-C power supply |
| Network | Wi-Fi or Ethernet (required for weather and transit data) |

The dashboard is optimized for touch input and continuous 24/7 operation.

---

## Software Requirements

- **Raspberry Pi OS** (64-bit recommended) with desktop environment
  - Debian 11 (Bullseye) — X11 / Openbox
  - Debian 12 (Bookworm) — Wayland (Wayfire) or X11
- Internet connection during initial setup (APT packages, Node.js, npm dependencies)

---

## Before You Begin

### 1. Flash Raspberry Pi OS

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
2. Flash **Raspberry Pi OS (64-bit)** with desktop to your microSD card.
3. In Imager advanced options (gear icon), configure:
   - Hostname (e.g. `rpi-dashboard`)
   - Username and password
   - Wi-Fi credentials (if not using Ethernet)
   - Enable SSH (optional, useful for headless setup)
4. Boot the Pi, complete the first-run wizard, and connect to your network.

### 2. Update the system

```bash
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```

### 3. Enable auto-login to desktop (required for kiosk)

The kiosk launches when the desktop session starts. Enable auto-login:

1. Open **Raspberry Pi Configuration** (`Menu → Preferences → Raspberry Pi Configuration`).
2. Go to **System → Boot → Desktop Autologin**.
3. Select **Desktop Autologin** (as your user).
4. Click **OK** and reboot if prompted.

Alternatively, via raspi-config:

```bash
sudo raspi-config
# System Options → Boot / Auto Login → Desktop Autologin
```

---

## Configuration (`config.json`)

The dashboard reads settings from `config.json` in the project root. This file is **not** committed to git (see `.gitignore`), so you must create it yourself.

Create `config.json` before or after cloning:

```bash
nano ~/raspberrypi-dashboard/config.json
```

Example configuration (Munich defaults):

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

### Configuration reference

| Section | Key | Description |
|---------|-----|-------------|
| `weather` | `city`, `latitude`, `longitude`, `timezone` | Location for Open-Meteo forecasts |
| `transit.stations[]` | `id` | MVG station ID (e.g. `de:09162:6`) |
| | `name` | Display name on the dashboard |
| | `allowedProducts` | Filter: `U_BAHN`, `S_BAHN`, `TRAM`, `BUS`, `REGIONAL_BUS` |
| | `lines` | Line filter (empty = all lines) |
| | `directions` | Destination filter (empty = all directions) |
| `ui` | `weatherPollIntervalMs` | Weather refresh interval (default: 5 min) |
| | `transitPollIntervalMs` | Transit refresh interval (default: 30 sec) |
| | `locale` | e.g. `de-DE`, `en-US`, `pt-PT` |
| | `timeFormat` | `24h` or `12h` |

If `config.json` is missing, the backend falls back to built-in Munich defaults.

---

## Automated Installation (Recommended)

The `deploy/setup-kiosk.sh` script handles the full production setup.

### Step 1 — Clone the repository

```bash
cd ~
git clone https://github.com/gabrielmeireles/raspberrypi-dashboard.git
cd raspberrypi-dashboard
```

> **Tip:** Run setup as the user that will auto-login to the desktop (not root). If you use `sudo`, the script detects the original user via `$SUDO_USER`.

### Step 2 — Create your config (if not done yet)

```bash
nano config.json
# Paste and edit the JSON from the section above, then save (Ctrl+O, Enter, Ctrl+X)
```

### Step 3 — Run the installer

```bash
chmod +x deploy/setup-kiosk.sh
./deploy/setup-kiosk.sh
```

You may be prompted for your sudo password during package installation.

### Step 4 — Reboot

```bash
sudo reboot
```

After reboot, the Pi should:

1. Auto-login to the desktop
2. Start the `rpi-dashboard` systemd service (backend on port 3000)
3. Launch Chromium in full-screen kiosk mode at `http://localhost:3000`

---

## What the Installer Does

`deploy/setup-kiosk.sh` performs these steps automatically:

| Step | Action |
|------|--------|
| 1 | Detects the target user and project directory |
| 2 | Installs system packages: `curl`, `git`, `unclutter`, `x11-xserver-utils`, Chromium |
| 3 | Installs **Node.js 20 LTS** via NodeSource if Node 18+ is not present |
| 4 | Runs `npm run setup` and `npm run build` (frontend + backend) |
| 5 | Disables screen blanking / DPMS (Wayfire + LightDM) |
| 6 | Installs and enables the `rpi-dashboard` systemd service |
| 7 | Creates a desktop autostart entry pointing to `deploy/kiosk-x11.sh` |

---

## Deploy Scripts Reference

```
deploy/
├── setup-kiosk.sh        # Full automated installer
├── rpi-dashboard.service # Systemd unit (backend API + static frontend)
├── kiosk-x11.sh          # Chromium kiosk launcher for X11 / Openbox
└── kiosk-wayland.sh      # Chromium kiosk launcher for Wayland / Wayfire
```

### `rpi-dashboard.service`

Runs the Fastify backend as a systemd service:

- **User:** your Pi username (substituted during install)
- **Port:** `3000` (configurable via `PORT` env var)
- **Working directory:** project root
- **Command:** `npm --prefix backend run start`
- **Restart:** always (5 s delay)

### `kiosk-x11.sh` (default autostart)

Used on Bullseye and X11-based Bookworm sessions:

- Disables screen saver and DPMS via `xset`
- Hides the mouse cursor with `unclutter` after 0.1 s idle
- Waits for `http://localhost:3000/api/health` before launching Chromium
- Clears Chromium crash-restore flags to avoid "Restore pages?" prompts
- Launches Chromium with hardened kiosk flags (no pinch, no overscroll navigation, touch enabled)

### `kiosk-wayland.sh` (Wayland alternative)

For Bookworm with Wayland / Wayfire. Same health-check and Chromium flags, plus:

- `--ozone-platform=wayland`
- `--enable-features=UseOzonePlatform`

Screen blanking on Wayland is handled separately in `~/.config/wayfire.ini` by the installer.

---

## Wayland vs X11

The installer defaults to **X11** (`kiosk-x11.sh`) in the desktop autostart entry.

If you run **Wayland** (common on Bookworm with Wayfire), switch the autostart launcher:

```bash
nano ~/.config/autostart/dashboard-kiosk.desktop
```

Change the `Exec=` line to use the Wayland script:

```ini
Exec=/home/YOUR_USER/raspberrypi-dashboard/deploy/kiosk-wayland.sh
```

Replace `YOUR_USER` with your actual username and path if the project is elsewhere.

Reboot to apply:

```bash
sudo reboot
```

---

## Verifying the Installation

### Check the backend service

```bash
sudo systemctl status rpi-dashboard
```

Expected: `active (running)`.

### Check API health

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{"status":"ok","uptime":...,"timestamp":"..."}
```

### View live logs

```bash
journalctl -u rpi-dashboard -f
```

### Test kiosk manually (without reboot)

```bash
~/raspberrypi-dashboard/deploy/kiosk-x11.sh
# or, for Wayland:
~/raspberrypi-dashboard/deploy/kiosk-wayland.sh
```

Press `Alt+F4` or close Chromium to exit manual kiosk testing.

---

## Service Management

| Task | Command |
|------|---------|
| Start backend | `sudo systemctl start rpi-dashboard` |
| Stop backend | `sudo systemctl stop rpi-dashboard` |
| Restart backend | `sudo systemctl restart rpi-dashboard` |
| Enable on boot | `sudo systemctl enable rpi-dashboard` |
| Disable on boot | `sudo systemctl disable rpi-dashboard` |
| View logs | `journalctl -u rpi-dashboard -f` |
| View last 100 lines | `journalctl -u rpi-dashboard -n 100` |

After editing `config.json`, restart the service (config is re-read on the next API request; a restart ensures a clean state):

```bash
sudo systemctl restart rpi-dashboard
```

---

## Updating the Dashboard

When a new version is available:

```bash
cd ~/raspberrypi-dashboard
git pull
npm run setup
npm run build
sudo systemctl restart rpi-dashboard
```

If deploy scripts changed, re-run the installer or manually update the systemd unit and autostart files:

```bash
./deploy/setup-kiosk.sh
```

---

## Manual Installation (Alternative)

If you prefer not to use the automated script:

```bash
# 1. System packages
sudo apt update
sudo apt install -y curl git unclutter x11-xserver-utils chromium-browser

# 2. Node.js 20 (if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Clone and build
git clone https://github.com/gabrielmeireles/raspberrypi-dashboard.git
cd raspberrypi-dashboard
nano config.json   # create your config
npm run setup
npm run build

# 4. Install systemd service
sudo cp deploy/rpi-dashboard.service /etc/systemd/system/
sudo sed -i "s|%USER%|$USER|g" /etc/systemd/system/rpi-dashboard.service
sudo sed -i "s|%DASHBOARD_DIR%|$(pwd)|g" /etc/systemd/system/rpi-dashboard.service
sudo systemctl daemon-reload
sudo systemctl enable --now rpi-dashboard

# 5. Configure kiosk autostart
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/dashboard-kiosk.desktop << EOF
[Desktop Entry]
Type=Application
Name=Raspberry Pi Smart Dashboard Kiosk
Exec=$(pwd)/deploy/kiosk-x11.sh
X-GNOME-Autostart-enabled=true
EOF

chmod +x deploy/kiosk-x11.sh deploy/kiosk-wayland.sh
sudo reboot
```

---

## Troubleshooting

### Black screen after reboot

- Confirm **Desktop Autologin** is enabled.
- Check that the autostart file exists:
  ```bash
  cat ~/.config/autostart/dashboard-kiosk.desktop
  ```
- Check backend is running before kiosk starts:
  ```bash
  systemctl is-active rpi-dashboard
  curl -f http://localhost:3000/api/health
  ```

### Chromium shows "Restore pages?" or a blank page

The kiosk scripts clear crash flags automatically. If the issue persists:

```bash
rm -rf ~/.config/chromium/SingletonLock
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
```

Then restart kiosk or reboot.

### Backend fails to start

```bash
journalctl -u rpi-dashboard -n 50 --no-pager
```

Common causes:

- **Build missing:** run `npm run build` in the project root.
- **Port in use:** check with `sudo lsof -i :3000`.
- **Node too old:** requires Node 18+; installer uses Node 20.

Test manually:

```bash
cd ~/raspberrypi-dashboard
npm --prefix backend run start
```

### Screen goes blank / sleeps

**X11:**

```bash
xset s off
xset s noblank
xset -dpms
```

**Wayland (Wayfire):** ensure `~/.config/wayfire.ini` contains:

```ini
[idle]
toggle = none
screensaver_timeout = 0
dpms_timeout = 0
```

Re-run `./deploy/setup-kiosk.sh` to re-apply these settings.

### No transit or weather data

- Verify network connectivity: `ping -c 3 1.1.1.1`
- Check API responses:
  ```bash
  curl http://localhost:3000/api/weather
  curl http://localhost:3000/api/transit
  ```
- Review station IDs in `config.json` (MVG station IDs must be valid).

### Mouse cursor visible on screen

The X11 kiosk script uses `unclutter`. Ensure it is installed:

```bash
sudo apt install unclutter
```

Wayland sessions do not use `unclutter` by default.

### Wrong display resolution / touch misaligned

Use **Screen Configuration** (`Menu → Preferences → Screen Configuration`) or:

```bash
sudo raspi-config
# Display Options → Resolution
```

Official 7" touchscreen typically uses 800×480 or 1024×600 depending on model/firmware.

---

## Optional: SSH Headless Setup

You can complete most steps over SSH before attaching the display:

```bash
ssh pi@rpi-dashboard.local
# ... clone, configure, run setup-kiosk.sh ...
sudo reboot
```

Ensure auto-login to desktop is configured so the kiosk starts when the Pi boots with a display connected.

---

## Quick Reference

| Item | Value |
|------|-------|
| Dashboard URL | `http://localhost:3000` |
| Health check | `http://localhost:3000/api/health` |
| Config file | `~/raspberrypi-dashboard/config.json` |
| Systemd service | `rpi-dashboard` |
| Kiosk autostart | `~/.config/autostart/dashboard-kiosk.desktop` |
| Backend logs | `journalctl -u rpi-dashboard -f` |

---

## Next Steps

- Customize `config.json` for your location and MVG stations.
- Set `ui.locale` to match your preferred language (`de-DE`, `en-US`, `pt-PT`).
- After config changes, restart the service: `sudo systemctl restart rpi-dashboard`.

For development on a PC before deploying to the Pi, see the **Local Development** section in [README.md](./README.md).
