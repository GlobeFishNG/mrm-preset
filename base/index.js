const { ini, makeDirs, deleteFiles, yaml, MrmError } = require('mrm-core');
const {
  chmodAllSync,
  copyAllFiles,
  getConfig,
  readPackageJson,
  presetVersion
} = require('../util');
const { lines, packageJson } = require('../core');

const gitIgnoresToRemove = [
  '.*',
  '.github/',
  '*.js',
  'npm-shrinkwrap.json',
];

const gitIgnoresToAdd = [
  // node.js
  'node_modules/',
  '!/src/node_modules/',
  '!/test/node_modules/',
  'package-lock.json',
  '*.heapsnapshot',
  '.npmrc',
  // OS
  '.DS_Store',
  'Thumbs.db',
  '*.stackdump',
  '*~',
  // ide, editor
  '.vscode/',
  '!.vscode/settings.json',
  '.idea/',
  '*.sublime-project',
  '*.sublime-workspace',
  // log
  '*.log',
  'npm-debug.log.*',
  // generated files
  '.nyc_output/',
  'lib/',
  'dist/',
  'package/',
  'build/',
  '.jscpd/',
  'reports/',
  '*.tgz',
  // temporary files
  '*.tmp',
  '*.bak',
  '*.swp',
  // generated api source files
  'src/generated/',
  // generated gitlab page static files
  '.typedoc',
  '.eslintcache'
];

function gitignore() {
  lines('.gitignore')
    .remove(gitIgnoresToRemove)
    .add(gitIgnoresToAdd)
    .save();
}

function gitattributes() {
  lines('.gitattributes')
    .add('*.sh text eol=lf')
    .add('*.ts text eol=lf')
    .add('*.md text eol=lf')
    .add('*.json text eol=lf')
    .add('*.yml text eol=lf')
    .save();
}

function editorconfig() {
  ini('.editorconfig', 'Install VSCode extension: `ext install EditorConfig`')
    .set('_global', { 'root': true })
    .set('*', {
      charset: 'utf-8',
      indent_style: 'space',
      indent_size: 2,
      end_of_line: 'lf',
      trim_trailing_whitespace: true,
      insert_final_newline: true
    })
    .save();
}

function npmignore() {
  lines('.npmignore')
    .prepend([
      '# First exclude everything',
      '*',
    ])
    .add([
      '!lib/**',
    ])
    .save();
}

function package(config) {
  const type = getConfig(config, 'type', 'service');

  const pkg = packageJson()
    .set('main', 'lib/index.js')
    .set('config.type', type)
    .set('scripty.silent', true)

    .setScript('clean', 'SCRIPTY_PARALLEL=true scripty')
    .setScript('build', 'scripty')
    .setScript('compile', 'scripty')
    .setScript('test', 'scripty')
    .setScript('testall', 'scripty')
    .setScript('_on_compile_success', 'scripty')
    .setScript('_on_compile_failure', 'scripty')
    .setScript('_copylib', 'mkdir -p lib && cp -R build/src/* lib/')
    .setScript('cpd', 'jscpd')
    .setScript('setup', 'scripts/setup.sh')  // Can not use scripty, because modules aren't install yet.
    .addDependency('@types/chai')
    .addDependency('@types/mocha')
    .addDependency('chai')
    .addDependency('jscpd')
    .addDependency('mocha')
    .addDependency('mrm')
    .addDependency('scripty')
    .addDependency('tsc-watch')
    .addDependency('source-map-support')
    .addDependency('trace')
    .addDependency('clarify')
    .save();
}

function task(config) {
  gitignore();
  gitattributes();
  editorconfig();
  npmignore();

  makeDirs(['src', 'test', 'scripts', 'docs']);
  copyAllFiles(__dirname);
  chmodAllSync('./scripts', '755');

  package(config);
}

task.description = 'Setup project scaffold. It must be the first task to run.';
module.exports = task;