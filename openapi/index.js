const { chmodAllSync, copyAllFiles } = require('../util');
const { packageJson } = require('../core');

function task() {
  copyAllFiles(__dirname);

  chmodAllSync('./scripts', '755');

  packageJson()
    // .setScript('compile:genapicode', 'scripty')
    .setScript('openapi:codegen', 'scripty')
    .setScript('openapi:dev', 'scripty')
    .addDependency('@types/body-parser')
    .addDependency('@types/ejs')
    .addDependency('@types/express')
    .addDependency('@types/joi')
    .addDependency('@types/lodash')
    .addDependency('@types/mz')
    .addDependency('@types/shelljs')
    .addDependency('@types/helmet')
    .addDependency('@types/hapi__joi')
    .addDependency('@hapi/joi', { type: 'product' })
    .addDependency('body-parser', { type: 'product' })
    .addDependency('ejs', { type: 'product' })
    .addDependency('express', { type: 'product' })
    .addDependency('helmet', { type: 'product' })
    // .addDependency('joi', { type: 'product' })
    .addDependency('json-schema')
    .addDependency('json-schema-ref-parser')
    .addDependency('json-schema-to-joi')
    .addDependency('json-schema-to-typescript')
    .addDependency('lodash', { type: 'product' })
    .addDependency('mz')
    .addDependency('openapi-types')
    .addDependency('shelljs')
    .addDependency('swagger-parser')
    .addDependency('ts-node')
    .addDependency('scripty')
    .unset('productionDependencies')  // Fix: remove productDependencies that was introduced in 1.48.0.
    .save();
}

task.description = 'Generate TypeScript interfaces/Joi schemas code from OpenAPI docs';
module.exports = task;