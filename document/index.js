const {
  chmodAllSync,
  copyAllFiles,
  getConfig,
} = require('../util');
const { packageJson } = require('../core');


function package() {
  packageJson()
    .setScript('doc', 'scripty')
    .addDependency('doctoc')
    .addDependency('node-fetch')
    .addDependency('plantuml-encoder')
    .addDependency('redoc-cli')
    .save();
}


function task() {
  copyAllFiles(__dirname);
  chmodAllSync('./scripts', '755');

  package();
}

task.description = 'Setup automatic document generation workflow';
module.exports = task;
