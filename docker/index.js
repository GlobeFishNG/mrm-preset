const { makeDirs } = require('mrm-core');
const { chmodSync } = require('fs');
const {
  chmodAllSync,
  copyAllFiles,
  getConfig,
  isService} = require('../util');
const { packageJson } = require('../core');

function task(config) {
  const type = getConfig(config, 'type', 'service'); // service/lib
  if (isService(type)) {
    makeDirs([
      'scripts/docker', 
      'containers',
    ]);
    copyAllFiles(__dirname);
    chmodAllSync('./scripts', '755');
    chmodSync('./containers/build.sh', '755');
    const pkg = packageJson()
      .setScript('docker:build', 'scripty')
      .setScript('docker:login', 'scripty')
      .setScript('docker:push', 'scripty')
      .save();
  }
}

task.description = 'Setup project scaffold. It must be the first task to run.';
module.exports = task;