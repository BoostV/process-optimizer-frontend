#!/usr/bin/env bash
# Run the inspection harness inside the official Playwright image.
# Browsers + OS libraries come from the image; the repo (incl. node_modules,
# which is Linux-compatible in a Linux sandbox) is bind-mounted, so no custom
# image build is needed for the common case. Screenshots land in
# inspection/output/ inside the mounted repo and are visible on the host.
#
# We run as the container's default root user (no --user). Many sandboxes run
# the Docker daemon with user-namespace remapping, where the host user maps to
# container root; running as root then writes bind-mounted files back as the
# host user. Forcing --user breaks writes to the mounted repo in that setup.
set -euo pipefail

cd "$(dirname "$0")/.." # repo root

VERSION="$(node -p "require('@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${VERSION}-noble"
echo "Inspection harness → ${IMAGE}"

docker run --rm --ipc=host \
  -v "$PWD":/work -w /work \
  "$IMAGE" \
  npm run inspect
