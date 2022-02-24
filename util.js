const { json, copyFiles, makeDirs } = require('mrm-core');
const { join, relative, resolve } = require('path');
const { existsSync, readdirSync, lstatSync, chmodSync } = require('fs');
const { execSync } = require('child_process');
const _ = require('lodash');

const presetVersion = require(resolve(__dirname, './package.json')).version;

function listFiles(path) {
  if (!existsSync(path)) {
    return [];
  }
  if (lstatSync(path).isFile()) {
    return [path];
  }
  return _.flatten(
    _.map(readdirSync(path), f => listFiles(join(path, f)))
  );
}

function listDirs(path) {
  if (!existsSync(path) || lstatSync(path).isFile()) {
    return [];
  }

  if (!readdirSync(path).find((file) => {
    return lstatSync(join(path, file)).isDirectory();
  })) {
    return [path]
  }

  return _.flatten(
    _.map(readdirSync(path), f => listDirs(join(path, f)))
  );
}

function _copyAllFiles(dir, option) {
  const dirs = _.map(listDirs(dir), f => relative(dir, f));
  makeDirs(dirs);
  const files = _.map(listFiles(dir), f => relative(dir, f));
  copyFiles(dir, files, option);
}

function copyAllFiles(basedir) {
  _copyAllFiles(join(basedir, `files/default`), { overwrite: false });
  _copyAllFiles(join(basedir, `files/overwrite`), { overwrite: true });
}

function chmodAllSync(dir, mode) {
  _.forEach(listFiles(dir), f => chmodSync(f, mode));
}


function readPackageJson() {
  const file = json('package.json')
  if (!file.exists()) {
    throw new Error('File not exist: package.json');
  }

  const repo = file.get('repository');
  if (!repo) {
    console.log('Warning: missing "repository" in package.json');
  }
  const repoUrl = repo && repo.url || repo;
  const repoName = repoUrl ? repoUrl.match(/[:|\/](([A-Za-z0-9_\-]+\/)*[A-Za-z0-9_\-]+)(\.git)?$/)[1] : undefined;

  const m = file.get('name').match(/^(@(.*)\/)?(.*)/);

  return {
    repoName,
    repoUrl,
    scope: m[2],
    name: m[3]
  }
}

// Resolve config from:
// 1. config parameter from package.json
// 2. mrm config
function getConfig(taskConfig, key, defaultValue) {
  // const config = taskConfig.defaults({ [key]: defaultValue }).values();
  const config = _.defaults(taskConfig, { [key]: defaultValue })
  return json('package.json').get(`config.${key}`, config[key]);
}

/**
 * Retrieve available version of a package on registry
 * @param {*} pkgName
 * @param {*} tag - default to 'latest'
 */
function pkgVersion(pkgName, tag) {
  tag = tag || 'latest';
  return execSync(`yarn info -s ${pkgName} dist-tags.${tag}`).toString().trim();
}

/**
 * Test the value which passed in is kind of type
 * @param {*} val testing val
 * @param {*} type default to 'lib'
 */
function isOneOfType(val, type = 'lib') {
  return new RegExp(`^${type}(-.+)?$`, 'i').test(val);
}

module.exports = {
  listFiles,
  chmodAllSync,
  copyAllFiles,
  readPackageJson,
  getConfig,
  pkgVersion,
  presetVersion,
  isLib: (type) => isOneOfType(type, 'lib'),
  isService: (type) => isOneOfType(type, 'service'),
};
