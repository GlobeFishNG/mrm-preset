#!/bin/bash
set -ex

yarn ts-node src/main.ts 2>&1 | bunyan -L -o short
