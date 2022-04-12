const { makeDirs } = require('mrm-core');
const { chmodSync } = require('fs');
const {
  chmodAllSync,
  copyAllFiles,
  getConfig,
  isService,
  isLib} = require('../util');
const { packageJson } = require('../core');

function package(config) {
  const type = getConfig(config, 'type', 'service'); // service/lib

  const pkg = packageJson();
  if (isService(type)) {      
    pkg
      .setScript('npm:login', 'scripty')
      .setScript('npm:logout', 'scripty')
      // .setScript('npm:types:build', './scripts/npm/types/build.sh')
      // .setScript('npm:types:publish', './scripts/npm/types/publish.sh')
      .save();
  } else if (isLib(type)) {
    pkg
      .setScript('npm:login', 'scripty')
      .setScript('npm:logout', 'scripty')
      .setScript('npm:build', 'scripty')
      .setScript('npm:publish', 'scripty')
      .save();
  }
}

function task(config) {
  makeDirs([
    'scripts/npm', 
  ]);
  copyAllFiles(__dirname);
  chmodAllSync('./scripts', '755');

  package(config);
}

task.description = 'Setup project scaffold. It must be the first task to run.';
module.exports = task;