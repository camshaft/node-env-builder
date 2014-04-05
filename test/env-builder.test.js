/**
 * Module dependencies
 */

var should = require('should');
var builder = require('..');

var conf = {
  'default': {
    'default': {
      DEFAULT: true,
      INHERIT: 'default'
    },
    local: {
      DEFAULT_LOCAL: true,
      INHERIT: 'default-local'
    }
  },
  types: {
    ui: {
      'default': {
        TYPES_UI_DEFAULT: true,
        INHERIT: 'ui-default'
      },
      local: {
        TYPES_UI_LOCAL: true,
        INHERIT: 'ui-local',
        TYPE_CHECK: true
      }
    },
    other: {
      local: {
        TYPES_OTHER_LOCAL: true,
        TYPE_CHECK: false
      }
    }
  },
  apps: {
    'my-app': {
      'default': {
        APPS_MYAPP_DEFAULT: true,
        INHERIT: 'app-default'
      },
      local: {
        APPS_MYAPP_LOCAL: true,
        INHERIT: 'app-local'
      }
    }
  }
};

describe('env-builder', function() {
  var env = 'local';
  var types = ['ui', 'customer-facing', 'other'];
  var app = 'my-app';

  function build(layout, done) {
    builder(env, types, app, layout, function(err, ENV) {
      if (err) return done(err);
      should.exist(ENV);
      ENV.should.be.an.object;
      should(ENV.INHERIT).eql('app-local');
      should(ENV.TYPE_CHECK).eql(false);
      should(ENV.DEFAULT).eql(true);
      should(ENV.DEFAULT_LOCAL).eql(true);
      should(ENV.TYPES_UI_DEFAULT).eql(true);
      should(ENV.TYPES_UI_LOCAL).eql(true);
      should(ENV.TYPES_OTHER_LOCAL).eql(true);
      should(ENV.APPS_MYAPP_DEFAULT).eql(true);
      should(ENV.APPS_MYAPP_LOCAL).eql(true);
      done();
    });
  }

  it('should build an env object', function(done) {
    build(conf, done);
  });

  it('should evaluate functions in the conf', function(done) {
    build(recursiveReplace(conf, function(val) {
      return function() {
        return val;
      };
    }), done);
  });

  it('should evaluate async functions in the conf', function(done) {
    build(recursiveReplace(conf, function(val) {
      return function(fn) {
        process.nextTick(fn.bind(null, null, val));
      };
    }), done);
  });

  it('should evaluate async lazy functions in the conf', function(done) {
    build(recursiveReplace(conf, function(val) {
      return function(key) {
        if (typeof key === 'function') return key(null, val);
        return function(cb) {
          process.nextTick(function() {
            cb(null, val[key]);
          });
        };
      };
    }), done);
  });

  it('should evaluate doubly async lazy functions in the conf', function(done) {
    build(recursiveReplace(conf, function(val) {
      return function(key, fn) {
        if (!key) return val;
        process.nextTick(function() {
          fn(null, function(cb) {
            process.nextTick(function() {
              cb(null, val[key]);
            });
          });
        });
      };
    }), done);
  });
});

function recursiveReplace(obj, fn) {
  var newo = {};
  for (var key in obj) {
    if (key === 'local' || key === 'default') newo[key] = fn(obj[key]);
    else newo[key] = recursiveReplace(obj[key], fn);
  }
  return fn(newo);
}
