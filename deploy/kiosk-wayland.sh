#!/usr/bin/env bash
# ==============================================================================
# Raspberry Pi Smart Dashboard - Wayland (Wayfire/Labwc) Kiosk Launcher
# ==============================================================================

# Wait for backend server to be healthy
echo "Waiting for Smart Dashboard backend server on port 3000..."
until curl -s -f "http://localhost:3000/api/health" > /dev/null 2>&1; do
  sleep 1
done
echo "Dashboard server is UP! Launching Chromium Kiosk under Wayland..."

# Clean up Chromium state to avoid crash recovery prompts
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences 2>/dev/null || true
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences 2>/dev/null || true

# Determine Chromium binary name
if command -v chromium-browser >/dev/null 2>&1; then
  CHROME_BIN="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
  CHROME_BIN="chromium"
else
  echo "Error: Chromium not found!"
  exit 1
fi

# Launch Chromium in Wayland native kiosk mode
exec "$CHROME_BIN" \
  --kiosk \
  --ozone-platform=wayland \
  --enable-features=UseOzonePlatform \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --check-for-update-interval=31536000 \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --touch-events=enabled \
  "http://localhost:3000"
