#!/bin/bash

MODULE_LOC="dist_types"
PACKAGE_JSON_TEMPLATE="scripts/npm/template/types-package.json.ejs"
PACKAGE_JSON_DEST="${MODULE_LOC}/package.json";

rm -rf ${MODULE_LOC}
mkdir ${MODULE_LOC}

npx ejs -o ${PACKAGE_JSON_DEST} ${PACKAGE_JSON_TEMPLATE} \
  -i "{\"version\":\"${npm_package_version}\"}"

tsc -p types-tsconfig.json