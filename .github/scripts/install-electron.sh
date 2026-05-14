#!/usr/bin/env bash
#
# Workaround: electron@42 ships without a postinstall script and lazily
# downloads its binary on the first require('electron'). Its install.js
# uses @electron/get (ESM, loaded via require(esm)) and extract-zip. On
# recent Node (observed on Node 26) the extract-zip stage silently exits
# 0 without writing node_modules/electron/path.txt, so subsequent
# require('electron') calls fail with ENOENT.
#
# This script downloads the binary with @electron/get (which works on its
# own) and extracts it with the system `unzip`, then writes path.txt the
# way install.js would have.
#
# TODO: try removing this script and the workflow call to it when
# upgrading to electron 43 or newer -- upstream may have fixed the
# install.js bug by then.

set -euo pipefail

ELECTRON_DIR="node_modules/electron"

# electron <42 has a working postinstall that writes path.txt itself, so
# we only run when path.txt is missing.
if [ -f "$ELECTRON_DIR/path.txt" ]; then
  exit 0
fi

RED='\033[1;31m'
NC='\033[0m'
ELECTRON_VERSION=$(node -p "require('./$ELECTRON_DIR/package.json').version")
printf "${RED}=====================================================================${NC}\n"
printf "${RED}WARNING: applying broken-electron-installer workaround for electron@${ELECTRON_VERSION}.${NC}\n"
printf "${RED}Try removing .github/scripts/install-electron.sh and its workflow call${NC}\n"
printf "${RED}when upgrading to electron 43 or newer.${NC}\n"
printf "${RED}=====================================================================${NC}\n"

ZIPPATH=$(cd "$ELECTRON_DIR" && node -e "(async () => {
  const { downloadArtifact } = await import('@electron/get');
  const { version } = require('./package.json');
  const zipPath = await downloadArtifact({ version, artifactName: 'electron', platform: process.platform, arch: process.arch });
  process.stdout.write(zipPath);
})().catch(e => { console.error(e); process.exit(1); });")

echo "Downloaded $ZIPPATH, extracting via system unzip..."
mkdir -p "$ELECTRON_DIR/dist"
unzip -q -o "$ZIPPATH" -d "$ELECTRON_DIR/dist"

case "${RUNNER_OS:-$(uname -s)}" in
  Linux|Linux*)              printf electron                                > "$ELECTRON_DIR/path.txt" ;;
  macOS|Darwin*)             printf "Electron.app/Contents/MacOS/Electron"  > "$ELECTRON_DIR/path.txt" ;;
  Windows|MINGW*|MSYS*|CYG*) printf electron.exe                            > "$ELECTRON_DIR/path.txt" ;;
  *) echo "ERROR: unknown OS '${RUNNER_OS:-$(uname -s)}'"; exit 1 ;;
esac

test -f "$ELECTRON_DIR/path.txt" || { echo "ERROR: path.txt missing after workaround"; ls -la "$ELECTRON_DIR/"; exit 1; }
