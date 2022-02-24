const {
  lines: _lines,
  json: _json,
  packageJson: _packageJson,
} = require('mrm-core');

const { pkgVersion } = require('./util');

function json(args) {
  return Object.assign(_json(args), {

    /**
     * Set if not exists
     */
    setnx(key, value) {
      this.set(key, this.get(key, value));
      return this;
    }
  });
}

function lines(args) {
  return Object.assign(_lines(args), {

    prepend(values) {
      values.forEach(this.remove.bind(this));
      const content = this.get();
      content.unshift(...values);
      this.set(content);
      return this;
    },

    // same as String.replace()
    replace(regexp, replacer) {
      if (replacer) {
        this.set(this.get().map(l => l.replace(regexp, replacer)));
      }
      return this;
    },

  });
}

/**
 * Extends `json`
 * @param {*} args
 */
function packageJson(args) {
  return Object.assign(_packageJson(args), {

    /**
     * Add a dependency into package.json if it doesn't exist
     * @param {*} pkg
     * @param {*} options
     *  - version
     *  - type: product, dev(default), peer, optional
     *  - exact: boolean (default to true, ignore if version is given)
     */
    addDependency(pkg, options) {
      options = options || {};

      const type = options.type || 'dev';
      const section = type === 'product' ? `dependencies` : `${type}Dependencies`;
      const key = `${section}.${pkg}`;

      // Flow diagram: http://www.plantuml.com/plantuml/png/POv12i9034NtEKMMqoieOZVY3TmB_TL0pPGc5hrzPoPTwIRyvBt0xytlYxzV4xL092Ed0VFb8-RdZlq9vVI5TSHSsOh59EjLLkWl3mFrzHRQwL6zVVcpcStpt29qaB4aJ0PEcaFOSS2O1uCVgO6-N4hp3G00

      const existingVersion = this.get(key);
      if (existingVersion) {
        if (!options.version) {
          return this;
        }
        if (existingVersion === options.version) {
          return this;
        }
      }

      let version = options.version || pkgVersion(pkg);
      if (!options.version && options.exact === false) {
        version = '^' + version;
      }
      this.set(key, version);
      return this;
    },

  });
}

module.exports = {
  json,
  lines,
  packageJson,
}
