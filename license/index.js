const { template, json } = require('mrm-core');
const { join } = require('path');

function task() {
  json('./package.json')
    .set('license', 'SEE LICENSE IN LICENSE')
    .save();
  template('LICENSE', join(__dirname, `files/template/NG`))
    .apply({ year: new Date().getFullYear() })
    .save();
}

task.description = 'Adds license file';
module.exports = task;