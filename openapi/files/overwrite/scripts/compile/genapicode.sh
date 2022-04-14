#!/bin/bash
set -e

yarn ts-node scripts/openapi/ts/legacy
yarn lint