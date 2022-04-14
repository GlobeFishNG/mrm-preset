#!/usr/bin/env node

const plantuml = require('plantuml-encoder');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const _ = require('lodash');
const fetch = require('node-fetch');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function fetchUml(src) /* => Promise<Buffer> */ {
  const url = `http://www.plantuml.com/plantuml/img/${plantuml.encode(src)}`;
  return fetch(url).then(res => res.buffer());
}

function compareMtime(file1, file2) {
  return fs.statSync(file1).mtime - fs.statSync(file2).mtime;
}

function generateUml(filePath) {
  const { dir, name } = path.parse(filePath);
  const pngFile = path.resolve(dir, name + '.png');
  if (fs.existsSync(pngFile) && compareMtime(pngFile, filePath) >= 0) {
    console.log(`${pngFile} is newer then ${filePath}, need not to re-generate.`);
    return;
  }
  console.log('Generating', filePath);
  readFile(filePath, 'utf8')
    .then(fetchUml)
    .then(buffer => writeFile(pngFile, buffer));
}

function listFiles(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  if (fs.lstatSync(filePath).isFile()) {
    return [filePath];
  }
  return _.flatten(
    _.map(fs.readdirSync(filePath), f => listFiles(path.join(filePath, f)))
  );
}

console.log('Generate PlantUML diagrams');

listFiles('./docs/uml')
  .filter(file => _.includes(['.puml', '.uml'], path.extname(file)))
  .forEach(generateUml);
