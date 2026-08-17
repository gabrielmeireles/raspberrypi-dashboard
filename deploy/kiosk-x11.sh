#!/usr/bin/env bash
# ==============================================================================
# Raspberry Pi Smart Dashboard - X11 Kiosk Launcher
# ==============================================================================

# Disable screen saver and power management (DPMS)
xset s off
xset s noblank
xset -dpms

# Hide mouse cursor after 0.1s idle
unclutter -idle 0.1 -root &

# Wait for backend server to be healthy
echo "Waiting for Smart Dashboard backend server on port 3000..."
until curl -s -f "http://localhost:3000/api/health" > /dev/null 2>&1; do
  sleep 1
done
echo "Dashboard server is UP! Launching Chromium Kiosk..."

# Clean up Chromium state from any previous unclean shutdowns to prevent restore prompt
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences 2>/dev/null || true
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences 2>/dev/null || true

# Determine Chromium binary name (chromium-browser or chromium)
if command -v chromium-browser >/dev/null 2>&1; then
  CHROME_BIN="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
  CHROME_BIN="chromium"
else
  echo "Error: Chromium not found!"
  exit 1
fi

# Launch Chromium in hardened full-screen kiosk mode
exec "$CHROME_BIN" \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --check-for-update-interval=31536000 \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --enable-features=OverlayScrollbar \
  --autoplay-policy=no-user-gesture-required \
  --disable-features=TranslateUI \
  --disable-component-update \
  --disable-features=TouchpadAndWheelScrollLatching \
  --touch-events=enabled \
  "http://localhost:3000"
