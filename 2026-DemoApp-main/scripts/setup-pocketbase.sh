#!/usr/bin/env bash
# Downloads the PocketBase binary into ./pocketbase (the binary is not committed to Git).
# The migrations in ./pocketbase/pb_migrations are applied automatically on "./pocketbase serve".
# Usage (from 2026-DemoApp-main): bash scripts/setup-pocketbase.sh
set -euo pipefail

VERSION="0.40.6"
DIR="$(cd "$(dirname "$0")/.." && pwd)/pocketbase"

if [ -x "$DIR/pocketbase" ]; then
  echo "PocketBase is already installed: $("$DIR/pocketbase" --version)"
  exit 0
fi

case "$(uname -m)" in
  x86_64) ARCH="amd64" ;;
  aarch64 | arm64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $(uname -m)"; exit 1 ;;
esac

ZIP="pocketbase_${VERSION}_linux_${ARCH}.zip"
URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/${ZIP}"

mkdir -p "$DIR"
echo "Downloading $URL"
curl -fsSL "$URL" -o "/tmp/$ZIP"
unzip -o -q "/tmp/$ZIP" pocketbase -d "$DIR"
rm "/tmp/$ZIP"
chmod +x "$DIR/pocketbase"
echo "Installed: $("$DIR/pocketbase" --version)"
echo "Next: cd pocketbase && ./pocketbase serve, then create the admin account at http://127.0.0.1:8090/_/"
