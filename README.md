## hapi-response-meta

[![npm version](https://badge.fury.io/js/hapi-response-meta.svg)](http://badge.fury.io/js/hapi-response-meta)
[![Build Status](https://travis-ci.org/developmentseed/hapi-response-meta.svg?branch=master)](https://travis-ci.org/developmentseed/hapi-response-meta)

This [Hapi](http://hapijs.com/) plugin adds metadata to a hapi response.

### Installation

    $: npm install hapi-response-meta

### Registration

```javascript
var Hapi = require('hapi');

var hapi = new Hapi.Server();
hapi.connection();

hapi.register({
  register: require('hapi-response-meta'),
  options: {
    key: 'meta',
    content: {
        provided_by: 'Some Organization',
        site: 'example.com'
    },
    results: 'results',
    routes: ['/', '/api']
  }
};
```

### Example

    curl -X GET http://www.example.com

```json
{
    "meta": {
        "provided_by": "Some Organization",
        "site": "example.com"
    },
    "results": {
        "key": "value"
    }
}
```

### Test

    $ npm test
