const child_process = require('child_process');
const { json, yaml, MrmError } = require('mrm-core');
const semver = require('semver');
const { join, parse } = require('path');
const _ = require('lodash');
const fp = require('lodash/fp');
const { getConfig, listFiles, isLib } = require('../util');

function setResolutions(modules, json) {
  _.forEach(modules, module => {
    const version =
      json.get(`dependencies.${module}`)
      || json.get(`devDependencies.${module}`)
      || json.get(`optionalDependencies.${module}`);
    if (version) {
      json.set(`resolutions.**/${module}`, version);
    }
  });
}

function updataIfExistAndNotSatisfied(json, key, expectVersion, allowLargerThan = false) {
  let current = json.get(key);
  if (current) {
    try {
      if (!semver.satisfies(expectVersion, current)) {
        current = current.replace(/^(>=?|\^)/g, '');
        if (!allowLargerThan || semver.lt(current, expectVersion)) {
          json.set(key, expectVersion);
        }
      }
    } catch (err) {
      console.log(key, err);
      json.set(key, expectVersion);
      console.log('Version has been overwritten');
    }
  }
}

function isInScope(name, scope) {
  const s = name.match(/^(@(.*)\/)?(.*)/)[2];
  return s && s === scope;
}

function checkUnregisteredDependencies(pkgJson, preset, depType) {
  const isNgiqScope = _.partial(isInScope, _, 'ngiq');

  const allowList = depType === 'devDependencies' ?
    _.keys(preset['devDependencies']) :
    _.concat(_.keys(preset['dependencies']), pkgJson.get('config.excludeBundledDependencies'));
  const inList = _.partial(_.includes, allowList);
  const forbidden = _(_.keys(pkgJson.get(depType)))
    .filter(_.negate(isNgiqScope))
    .filter(_.negate(inList))
    .value();
  if (!_.isEmpty(forbidden)) {
    if (depType === 'devDependencies' || pkgJson.get('config.branch') === 'dev') {
      console.log(`Warning: found preset unlisted package ${forbidden} in ${depType}`);
    } else {
      throw new MrmError('Not allow to use package: ' + forbidden);
    }
  }
}

function checkRestrictedDependencies(pkgJson, preset) {
  const existInDep = _.partial(_.includes, _.keys(pkgJson.get('dependencies')));
  const notIncludeCurrentPkg = _.negate(_.partial(_.includes, _, pkgJson.get('name')));
  const forbidden = _(preset.dependenciesOnly)
    .pickBy(_.flip(existInDep))
    .pickBy(notIncludeCurrentPkg)
    .keys()
    .value();
  if (!_.isEmpty(forbidden)) {
    throw new MrmError('Not allow to use package: ' + forbidden);
  }
}

function enforceDependencyVersion(pkgJson, name, version) {
  const allowLargerThan = isInScope(name, 'ngiq');
  updataIfExistAndNotSatisfied(pkgJson, `dependencies.${name}`, version, allowLargerThan);
  updataIfExistAndNotSatisfied(pkgJson, `devDependencies.${name}`, version, allowLargerThan);
  updataIfExistAndNotSatisfied(pkgJson, `optionalDependencies.${name}`, version, allowLargerThan);
  updataIfExistAndNotSatisfied(pkgJson, `peerDependencies.${name}`, version, allowLargerThan);
}

function availableBranches() {
  return listFiles(join(__dirname, 'config'))
    .map(parse)
    .filter(f => f.ext === '.yml')
    .map(fp.get('name'));
}

function keys(obj) {
  return obj ? Object.keys(obj) : [];
}

function updateBundle(pkgJson) {
  const depList = keys(pkgJson.get('dependencies')).concat(keys(pkgJson.get('optionalDependencies')));
  const excludeList = pkgJson.get('config.excludeBundledDependencies');
  const notExcluded = p => excludeList ? !excludeList.includes(p) : true;
  pkgJson.set('bundledDependencies', depList.filter(notExcluded));
}

function checkDependency(pkgJson, preset) {
  if (pkgJson.get('devDependencies.@types/express')) {
    pkgJson.set('devDependencies.@types/express-serve-static-core', "4.17.2");
  }

  if (pkgJson.get('dependencies.pg') &&
    semver.lte(pkgJson.get('dependencies.pg'), '7.4.1') &&
    preset.devDependencies['pg-pool']) {
    pkgJson.set('devDependencies.pg-pool', preset.devDependencies['pg-pool']);
  }
}

function updateBranch() {
  try {
    const branch = child_process.execSync('git symbolic-ref --short -q HEAD');
  } catch (error) {
    return;  
  }
}

function task(config) {
  updateBranch();
  const branch = getConfig(config, 'branch', 'master');
  const configFile = yaml(join(__dirname, `config/${branch}.yml`));
  if (!configFile.exists()) throw new MrmError(`No dependencies configuration for ${branch} in preset`);
  const preset = configFile.get();

  const pkgJson = json('package.json');
  pkgJson.set('config.branch', branch);
  pkgJson.unset('resolutions');

  checkDependency(pkgJson, preset);

  _.forEach(
    _.assign({}, preset.devDependencies, preset.dependencies),
    (version, name) => enforceDependencyVersion(pkgJson, name, version)
  );
  if (!isLib(getConfig(config, 'type'))) {
    updateBundle(pkgJson);
  }

  setResolutions(_.keys(preset.resolutions), pkgJson);
  pkgJson.save();

  checkUnregisteredDependencies(pkgJson, preset, 'dependencies');
  checkUnregisteredDependencies(pkgJson, preset, 'optionalDependencies');
  checkUnregisteredDependencies(pkgJson, preset, 'devDependencies');

  checkRestrictedDependencies(pkgJson, preset);
}

task.description = 'Enforce dependencies version. Config: `branch`, default to `master`';
module.exports = task;
module.exports.availableBranches = availableBranches;
