/**
 * Module dependencies
 */

var debug = require('debug')('env-builder');
var merge = require('utils-merge');
var Batch = require('batch');

/**
 * Build an env
 *
 * @param {String} env
 * @param {Array} types
 * @param {String} app
 * @param {Object} conf
 * @param {Function} fn
 */

module.exports = function(env, types, app, conf, fn) {
  var ENV = {};
  get(conf, function(err, layout) {
    if (err) return fn(err);

    mergeDefault(env, layout, ENV, function(err) {
      if (err) return fn(err);

      mergeTypes(env, types, layout, ENV, function(err) {
        if (err) return fn(err);

        mergeApp(env, app, layout, ENV, function(err) {
          if (err) return fn(err);
          fn(null, ENV);
        });
      });
    });
  });
};

function mergeDefault(env, conf, ENV, fn) {
  debug('# DEFAULT');
  mergeConf(env, conf, 'default', ENV, fn);
}

/**
 * Merge types into ENV
 *
 * @param {String} env
 * @param {Array} types
 * @param {Object} conf
 * @param {Object} ENV
 * @param {Function} fn
 */

function mergeTypes(env, types, conf, ENV, fn) {
  fetch(conf, 'types', function(err, layout) {
    if (err) return fn(err);
    debug('# TYPES');

    var batch = new Batch();

    batch.concurrency(1);

    types.forEach(function(type) {
      batch.push(function(cb) {
        debug(type);
        mergeConf(env, layout, type, ENV, cb);
      });
    });

    batch.end(fn);
  });
}

/**
 * Merge app into ENV
 *
 * @param {String} env
 * @param {String} app
 * @param {Object} conf
 * @param {Object} ENV
 * @param {Function} fn
 */

function mergeApp(env, app, conf, ENV, fn) {
  fetch(conf, 'apps', function(err, apps) {
    if (err) return fn(err);
    debug('# APP');
    debug(app);
    mergeConf(env, apps, app, ENV, fn);
  });
}

/**
 * Merge conf into ENV
 *
 * @param {String} env
 * @param {Object} conf
 * @param {String} key
 * @param {Object} ENV
 * @param {Function} fn
 */

function mergeConf(env, conf, key, ENV, fn) {
  fetch(conf, key, function(err, layout) {
    if (err) return fn(err);

    fetch(layout, 'default', function(err, defaults) {
      if (err) return fn(err);

      debug('  default', defaults);
      merge(ENV, defaults);
      debug('    ', ENV);

      fetch(layout, env, function(err, envs) {
        if (err) return fn(err);

        debug('  ' + env, envs);
        merge(ENV, envs);
        debug('    ', ENV);

        fn();
      });
    });
  });
}

/**
 * Fetch an object by key
 *
 * @param {Object} conf
 * @param {String} key
 * @param {Function} fn
 */

function fetch(conf, key, fn) {
  getKey(conf, key, function(err, layout) {
    if (err) return fn(err);
    get(layout, fn);
  });
}

/**
 * Lazily evaluate a key/value
 *
 * @param {Object|Function} obj
 * @param {String} key
 * @param {Function} fn
 */

function getKey(obj, key, fn) {
  if (typeof obj === 'object') return fn(null, obj[key]);
  if (typeof obj === 'undefined') return fn(null, {});
  if (typeof obj !== 'function') return fn(new Error('cannot read conf:\n' + obj));
  if (obj.length === 2) return obj(key, fn);
  var val;
  try {
    val = obj(key);
  } catch(err) {
    return fn(err);
  }
  fn(null, val);
}

/**
 * Lazily evaluate the value
 *
 * @param {Any} obj
 * @param {Function} fn
 */

function get(obj, fn) {
  if (typeof obj === 'object') return fn(null, obj);
  if (typeof obj === 'undefined') return fn(null, {});
  if (typeof obj !== 'function') return fn(new Error('cannot read conf:\n' + obj));
  if (obj.length === 1) return obj(fn);
  var val;
  try {
    val = obj();
  } catch(err) {
    return fn(err);
  }
  fn(null, val);
}
