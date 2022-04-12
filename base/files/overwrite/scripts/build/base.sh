#!/bin/bash

set -euo pipefail

yarn clean

yarn format &
# yarn doc &
wait

yarn compile

yarn _copylib &
yarn lint &
wait

yarn cpd
