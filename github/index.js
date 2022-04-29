const _ = require('lodash');
const { join } = require('path');
const { yaml, template, makeDirs } = require('mrm-core');
const { copyAllFiles, readPackageJson, isLib, getConfig } = require('../util');

function codeOwners(name) {
  const config = yaml(join(__dirname, `config/codeowners.yml`));
  const owners = _.defaults(config.get(name), config.get('DEFAULT'))

  if (!_.isArray(owners?.codeowners)) {
    throw new Error(`codeowners are not valid:, ${owners}`);
  }

  console.log(`Repo ${name} is setting code owners: ${JSON.stringify(owners.codeowners)}`)

  owners.codeowners = owners.codeowners.map(owner => `@${owner}`).join(' ');

  template('.github/CODEOWNERS', join(__dirname, `files/template/CODEOWNERS`))
    .apply(owners)
    .save();
}

function task(config) {
  const { name } = readPackageJson();
  makeDirs([
    '.github/workflows', 
  ]);
  copyAllFiles(__dirname);
  codeOwners(name);

  const type = getConfig(config, 'type', 'service');
  if (isLib(type)) {
    template('.github/workflows/publish.yml', join(__dirname, `files/template/publish.yml`))
    .apply({ npm_package_name: name })
    .save();
  }
}

task.description = 'Adds Github config files';
module.exports = task;