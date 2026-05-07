#!/usr/bin/env bash
DEST="/Applications/Adobe Illustrator 2026/Presets/en_US/Scripts"

if [ ! -d "$DEST" ]; then
  echo "Illustrator Scripts folder not found: $DEST"
  exit 1
fi

cp -v scripts/*.jsx "$DEST/"
echo "Done."
