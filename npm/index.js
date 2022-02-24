const { makeDirs } = require('mrm-core');
const { chmodSync } = require('fs');
const {
  chmodAllSync,
  copyAllFiles,
  getConfig} = require('../util');
const { packageJson } = require('../core');

function package(config) {
  const type = getConfig(config, 'type', 'service'); // service/frontend-lib/service-lib/web/desktop
  const exportTypeScript = getConfig(config, 'exportTypeScript', false);

  const pkg = packageJson();
  if (type === 'service') {      
    if (exportTypeScript) {
      pkg
        .setScript('npm:login', './scripts/npm/login.sh')
        .setScript('npm:logout', './scripts/npm/logout.sh')
        .setScript('npm:types:build', './scripts/npm/types/build.sh')
        .setScript('npm:types:publish', './scripts/npm/types/publish.sh')
        .save();
    } 
  } else if (type.match(/-lib$/)) {
    pkg
      .setScript('npm:login', './scripts/npm/login.sh')
      .setScript('npm:logout', './scripts/npm/logout.sh')
      .setScript('npm:build', './scripts/npm/build.sh')
      .setScript('npm:publish', './scripts/npm/publish.sh')
      .save();
  }
}

function task(config) {
  makeDirs([
    'scripts/npm', 
  ]);
  copyAllFiles(__dirname);
  chmodAllSync('./scripts', '755');
  chmodSync('./containers/build.sh', '755');

  package(config);
}

task.description = 'Setup project scaffold. It must be the first task to run.';
module.exports = task;