const { json, yaml, deleteFiles } = require('mrm-core');
const { chmodAllSync, copyAllFiles, getConfig, isService } = require('../util');
const { packageJson } = require('../core');

function task(config) {
  copyAllFiles(__dirname);
  const target = getConfig(config, 'targetES', 'es2017');
  const tsconfig = json('tsconfig.json');
  const compilerOptions = tsconfig.get('compilerOptions', {});
  compilerOptions.target = target;
  if (target === 'es5') {
    compilerOptions.lib = ['es2015'];
  }
  tsconfig.set('compilerOptions', compilerOptions).save();

  chmodAllSync('./scripts', '755');

  // deleteFiles('tslint.json'); // replaced by tslint.yaml

  const pkg = packageJson();

  const type = getConfig(config, 'type');
  if (isService(type)) {
    pkg.set('engines.node', '>=14.19.1')
  } else {
    pkg.set('engines.node', '>=10.24.1')
  }

  pkg.set('typings', 'lib/index.d.ts')
    .setScript('format', 'tsfmt -r')
    .setScript('lint', 'scripty')
    .setScript('compile:typescript', 'scripty')
    .addDependency('eslint')
    .addDependency('eslint-config-prettier')
    .addDependency('eslint-plugin-import')
    .addDependency('eslint-plugin-jsdoc')
    .addDependency('eslint-plugin-lodash')
    .addDependency('eslint-plugin-no-null')
    .addDependency('eslint-plugin-prefer-arrow')
    .addDependency('eslint-plugin-security')
    .addDependency('eslint-plugin-unicorn')
    .addDependency('eslint-plugin-jest')
    .addDependency('typescript')
    .addDependency('typescript-formatter')
    .addDependency('tsc-watch')
    .addDependency('scripty')
    .addDependency('@typescript-eslint/parser')
    .addDependency('@typescript-eslint/eslint-plugin')
    .save();

  yaml('.cpd.yaml')
    .merge({ languages: ['typescript'] })
    .merge({ files: ['src/**/*.ts'] })
    .save();

  // create lint rules in test folder
  // deleteFiles('test/tslint.yaml');
  // yaml('test/tslint.yaml', yaml('tslint.yaml').get())
  //   .set('rules.no-big-function', false)
  //   .set('rules.no-duplicate-string', false)
  //   .set('rules.no-identical-functions', false)
  //   .save();
}

task.description = 'Adds TypeScript config files';
module.exports = task;
