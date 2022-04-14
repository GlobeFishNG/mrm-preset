const _ = require('lodash');
const { join } = require('path');
const { yaml, template, makeDirs } = require('mrm-core');
const { copyAllFiles, readPackageJson } = require('../util');

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
    '.github/', 
  ]);
  copyAllFiles(__dirname);
  codeOwners(name);
}

task.description = 'Adds Github config files';
module.exports = task;