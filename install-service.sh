#!/bin/bash
# Obesity1 Systemd Service Installation Script

echo "======================================"
echo "Obesity1 Systemd Service Installation"
echo "======================================"
echo ""

# 1. Copy service file
echo "1. Copying service file to /etc/systemd/system/..."
sudo cp /home/nbg/바탕화면/obesity1/obesity1.service /etc/systemd/system/
if [ $? -eq 0 ]; then
    echo "✓ Service file copied successfully"
else
    echo "✗ Failed to copy service file"
    exit 1
fi
echo ""

# 2. Reload systemd daemon
echo "2. Reloading systemd daemon..."
sudo systemctl daemon-reload
if [ $? -eq 0 ]; then
    echo "✓ Systemd daemon reloaded"
else
    echo "✗ Failed to reload systemd daemon"
    exit 1
fi
echo ""

# 3. Enable service
echo "3. Enabling obesity1 service (auto-start on boot)..."
sudo systemctl enable obesity1.service
if [ $? -eq 0 ]; then
    echo "✓ Service enabled for auto-start"
else
    echo "✗ Failed to enable service"
    exit 1
fi
echo ""

# 4. Start service
echo "4. Starting obesity1 service..."
sudo systemctl start obesity1.service
if [ $? -eq 0 ]; then
    echo "✓ Service started successfully"
else
    echo "✗ Failed to start service"
    exit 1
fi
echo ""

# 5. Check service status
echo "5. Checking service status..."
echo ""
sudo systemctl status obesity1.service --no-pager
echo ""

echo "======================================"
echo "Installation completed!"
echo "======================================"
echo ""
echo "Useful commands:"
echo "  - Check status: sudo systemctl status obesity1.service"
echo "  - Stop service: sudo systemctl stop obesity1.service"
echo "  - Restart service: sudo systemctl restart obesity1.service"
echo "  - View logs: sudo journalctl -u obesity1.service -f"
echo "  - Disable auto-start: sudo systemctl disable obesity1.service"
echo ""
