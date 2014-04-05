env-builder [![Build Status](https://travis-ci.org/camshaft/node-env-builder.svg)](https://travis-ci.org/camshaft/node-env-builder)
===========

Build environment variables with inheritance

Tests
-----

```sh
$ npm test
```

Layout
------

```sh
.
├── default
│   ├── default
│   ├── test
│   └── local
├── types
│   ├── ui
│   │   ├── default
│   │   ├── test
│   │   └── local
│   ├── api
│   │   ├── default
│   │   ├── test
│   │   └── local
│   └── auth
│       ├── default
│       ├── test
│       └── local
└── apps
    ├── my-first-app
    │   ├── default
    │   ├── test
    │   └── local
    ├── my-second-app
    │   ├── default
    │   ├── test
    │   └── local
    └── my-third-app
        ├── default
        ├── test
        └── local
```

```js
{
  default: {
    default: {
      API_URL: 'http://example.com'
    },
    test: {
      API_URL: 'http://test.example.com'
    },
    local: {
      API_URL: 'http://dev.example.com'
    }
  },
  types: {
    ui: {
      default: {
        NODE_ENV: 'production'
      },
      test: {
        NODE_ENV: 'test'
      },
      local: {
        NODE_ENV: 'development'
      }
    }
  },
  apps: {
    'my-first-app': {
      default: {
        APP_VAR: 'foo'
      },
      test: {
        APP_VAR: 'bar'
      },
      local: {
        APP_VAR: 'baz'
      }
    }
  }
}
```
