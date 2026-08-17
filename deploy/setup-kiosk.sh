#!/usr/bin/env bash
# ==============================================================================
# Raspberry Pi Smart Dashboard - Automated Setup & Kiosk Installer
# Compatible with Raspberry Pi OS (Debian 11 Bullseye & Debian 12 Bookworm)
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Raspberry Pi Smart Dashboard - Setup & Installer   ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Detect current user and working directory
ACTUAL_USER="${SUDO_USER:-$USER}"
USER_HOME=$(eval echo "~$ACTUAL_USER")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${GREEN}[1/6] Target User:${NC} $ACTUAL_USER"
echo -e "${GREEN}[1/6] Project Root:${NC} $PROJECT_ROOT"

# 1. Update and install required OS packages
echo -e "\n${BLUE}[2/6] Updating APT & installing required packages...${NC}"
sudo apt update
sudo apt install -y curl git unclutter x11-xserver-utils sed

# Install Chromium if not present
if ! command -v chromium-browser >/dev/null 2>&1 && ! command -v chromium >/dev/null 2>&1; then
  echo -e "${YELLOW}Installing Chromium Browser...${NC}"
  sudo apt install -y chromium-browser || sudo apt install -y chromium
fi

# 2. Check or install Node.js 20 LTS
echo -e "\n${BLUE}[3/6] Checking Node.js runtime...${NC}"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | sed 's/v//')" -lt 18 ]; then
  echo -e "${YELLOW}Installing Node.js 20 LTS via NodeSource...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo -e "Node.js version: $(node -v)"
echo -e "npm version:     $(npm -v)"

# 3. Build backend and frontend
echo -e "\n${BLUE}[4/6] Installing dependencies and building production assets...${NC}"
cd "$PROJECT_ROOT"
npm run setup
npm run build

# Make launcher scripts executable
chmod +x "$PROJECT_ROOT/deploy/kiosk-x11.sh"
chmod +x "$PROJECT_ROOT/deploy/kiosk-wayland.sh"

# 4. Configure Screen Blanking & Sleep Prevention
echo -e "\n${BLUE}[5/6] Disabling screen blanking and power management...${NC}"

# Wayfire / Wayland configuration (Bookworm)
WAYFIRE_INI="$USER_HOME/.config/wayfire.ini"
if [ -d "$USER_HOME/.config" ]; then
  if [ -f "$WAYFIRE_INI" ]; then
    if ! grep -q "\[idle\]" "$WAYFIRE_INI"; then
      cat <<EOT >> "$WAYFIRE_INI"

[idle]
toggle = none
screensaver_timeout = 0
dpms_timeout = 0
EOT
    fi
  fi
fi

# LightDM / X11 configuration (Bullseye/X11)
LIGHTDM_CONF="/etc/lightdm/lightdm.conf"
if [ -f "$LIGHTDM_CONF" ]; then
  sudo sed -i 's/^#xserver-command=X/xserver-command=X -s 0 -dpms/' "$LIGHTDM_CONF" || true
fi

# 5. Setup Systemd Service for Backend
echo -e "\n${BLUE}[6/6] Configuring systemd dashboard service...${NC}"
SERVICE_FILE="/etc/systemd/system/rpi-dashboard.service"

sudo cp "$PROJECT_ROOT/deploy/rpi-dashboard.service" "$SERVICE_FILE"
sudo sed -i "s|%USER%|$ACTUAL_USER|g" "$SERVICE_FILE"
sudo sed -i "s|%DASHBOARD_DIR%|$PROJECT_ROOT|g" "$SERVICE_FILE"

sudo systemctl daemon-reload
sudo systemctl enable rpi-dashboard.service
sudo systemctl restart rpi-dashboard.service

# 6. Configure Autostart for Kiosk Mode on Desktop Login
echo -e "\n${BLUE}Configuring desktop kiosk autostart...${NC}"
AUTOSTART_DIR="$USER_HOME/.config/autostart"
mkdir -p "$AUTOSTART_DIR"

cat <<EOT > "$AUTOSTART_DIR/dashboard-kiosk.desktop"
[Desktop Entry]
Type=Application
Name=Raspberry Pi Smart Dashboard Kiosk
Exec=$PROJECT_ROOT/deploy/kiosk-x11.sh
X-GNOME-Autostart-enabled=true
EOT

chown -R "$ACTUAL_USER:$ACTUAL_USER" "$USER_HOME/.config"

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✓ Installation Complete!                            ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "• Dashboard Service:  sudo systemctl status rpi-dashboard"
echo -e "• Local URL:          http://localhost:3000"
echo -e "• Test Kiosk manually: $PROJECT_ROOT/deploy/kiosk-x11.sh"
echo -e "• Reboot to test auto-kiosk: sudo reboot"
