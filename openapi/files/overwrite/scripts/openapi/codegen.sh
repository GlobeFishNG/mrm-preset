#!/bin/bash
set -ex

yarn ts-node scripts/openapi/ts/generate
yarn format