const { makeDirs } = require('mrm-core');
const { chmodSync } = require('fs');
const {
  chmodAllSync,
  copyAllFiles,
  getConfig} = require('../util');
const { packageJson } = require('../core');

function package(config) {
  const type = getConfig(config, 'type', 'service'); // service/lib

  if (type.match(/service/)) {
    const pkg = packageJson()
      .setScript('docker:build', './scripts/docker/build.sh')
      .setScript('docker:login', './scripts/docker/login.sh')
      .setScript('docker:push', './scripts/docker/push.sh')
      .save();
  }
}

function task(config) {
  makeDirs([
    'scripts/docker', 
    'containers',
  ]);
  copyAllFiles(__dirname);
  chmodAllSync('./scripts', '755');
  chmodSync('./containers/build.sh', '755');

  package(config);
}

task.description = 'Setup project scaffold. It must be the first task to run.';
module.exports = task;