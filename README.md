mut
---

A simple mutator module.

Usage
-----

````js
  var ee = require('event-emitter');
  var mut = require('mut');
  var scope = mut(ee({}));

  scope.on('change', function (key, value) {

    var previous = scope.previous(key);
    if (typeof value === 'object') value = JSON.stringify(value);
    if (typeof previous === 'object') previous = JSON.stringify(previous);
    console.log('Key "' + key + '" has changed from "' + previous + '" to "' + value + '"');
  });

  scope.set('a', 1);
  scope.set('a', 1);
  scope.set('a', 2);
  scope.set('b', { payload : { index : 0 }});
  scope.set('b', { payload : { index : 0 }});
  scope.set('b', { payload : { index : 1 }});

  // Key "a" has changed from "undefined" to "1"
  // Key "a" has changed from "1" to "2"
  // Key "b" has changed from "undefined" to "{"payload":{"index":0}}"
  // Key "b" has changed from "{"payload":{"index":0}}" to "{"payload":{"index":1}}"

````

See the unit tests for further information.

Licence
-------

MIT
