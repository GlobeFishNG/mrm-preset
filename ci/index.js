const _ = require('lodash');
const { join } = require('path');
const { deleteFiles, yaml, template } = require('mrm-core');
const { chmodAllSync, copyAllFiles, getConfig, readPackageJson, isLib } = require('../util');
const { packageJson } = require('../core');

function ciScript(name) {
  const config = yaml(join(__dirname, `config/coverage.yml`));
  const coverage = _.defaults(config.get(name), config.get('DEFAULT'))

  template('scripts/ci.sh', join(__dirname, `files/template/ci.sh`))
    .apply(coverage)
    .save();
}

function task(config) {
  const { name } = readPackageJson();
  ciScript(name);

  copyAllFiles(__dirname);
  chmodAllSync('./scripts', '755');

  const pkg = packageJson()
    .unset('nyc.include')
    .set('nyc.extension', ['.ts', '.tsx'])
    .set('nyc.exclude', ['**/*.d.ts', 'test/**/*.ts'])
    .set('nyc.reporter', ['text-summary','html'])
    .set('nyc.report-dir', 'reports/coverage')
    .setScript('ci', 'scripty')
    .addDependency('mochawesome')
    .addDependency('nyc');

  // TODO: v1.7.0 - can be deleted later
  pkg
    .removeScript('ci:test')
    .removeScript('ci:coverage')
    .removeScript('ci:lint');
  // END

  pkg.save();
}

task.description = 'Adds CI config files';
module.exports = task;
