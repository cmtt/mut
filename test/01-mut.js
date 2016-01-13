'use strict';

describe('mut', function () {

  it('example', function () {
    var scope = Mut(Ev({}));

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
  });

  it('returns the provide scope', function () {
    var obj = { id: '2' };
    var retval = Mut(obj);
    assert.deepEqual(retval, obj);
  });

  it('has set, get functions and an attributes object', function () {
    var obj = Mut({});
    assert.equal(typeof obj.set, 'function');
    assert.equal(typeof obj.get, 'function');
    assert.equal(typeof obj.hasChanged, 'function');
    assert.ok(typeof obj.attributes === 'object');
  });

  it('set, attributes', function () {
    var obj = Mut({});
    obj.set('id', 'test');
    assert.ok(obj.attributes);
    assert.deepEqual(obj.attributes, {
      id: 'test'
    });
    obj.set('test', true);
    assert.deepEqual(obj.attributes, {
      id: 'test',
      test: true
    });
  });

  it('unset', function () {
    var obj = Mut(Ev({}));
    obj.set('id', 'test');
    assert.deepEqual(obj.attributes, {
      id: 'test'
    });
    obj.unset('id');
    assert.deepEqual(obj.attributes, {});
  });

  it('get', function () {
    var obj = Mut({});
    obj.set({ id: 'test' });
    assert.equal(obj.get('id'), 'test');
    obj.set('topic', 'get');
    assert.equal(obj.get('topic'), 'get');
  });

  it('has', function () {
    var obj = Mut({});
    assert.equal(obj.has('test'), false);
    var values = {
      '0': 0,
      '1': 1,
      'true': true,
      'false': false,
      'empty': '',
      'topic': 'has',
      'null': null,
      'undefined': void 0
    };
    var keys = Object.keys(values);
    obj.set(values);
    keys.forEach(function (key) {
      assert.equal(obj.has(key), true, 'has ' + key);
      assert.equal(obj.get(key), values[key], 'get ' + key);
    });
  });

  it('previous', function () {
    var obj = Mut({});
    assert.equal(obj.previous('test'), void 0);
    obj.set('test', false);
    assert.equal(obj.previous('test'), void 0);
    obj.set('test', true);
    assert.equal(obj.previous('test'), false);
    obj.set('test', 1);
    assert.equal(obj.previous('test'), true);
  });

  it('hasChanged', function () {
    var obj = Mut({});
    assert.equal(obj.hasChanged('test'), false);
    obj.set('test', false);
    assert.equal(obj.hasChanged('test'), true);
    obj.set('test', false);
    assert.equal(obj.hasChanged('test'), false);
    obj.set('test', true);
    assert.equal(obj.hasChanged('test'), true);
  });

  it('triggers changes for nested objects', function (done) {
    var obj = Mut(Ev({}));
    var a = 0;
    var expected = [{ topic: 'nested', value: { index: 1 } }, { topic: 'nested2', value: { index: 1 } }, { topic: 'nested2', value: { index: 2 } }];
    obj.set('test', {
      test: true,
      info: { topic: 'nested', value: { index: 0 } }
    });

    obj.on('change', function (key, value, options) {
      assert.deepEqual(value, expected[a++]);
      if (a === 3) done();
    });

    obj.set('info', { topic: 'nested', value: { index: 1 } });
    obj.set('info', { topic: 'nested2', value: { index: 1 } });
    obj.set('info', { topic: 'nested2', value: { index: '1' } });
    obj.set('info', { topic: 'nested2', value: { index: 2 } });
  });

  it('triggers changes for nested objects (strict equality)', function (done) {
    var obj = Mut(Ev({}));
    var a = 0;
    var expected = [{ topic: 'nested', value: { index: 1 } }, { topic: 'nested2', value: { index: '1' } }, { topic: 'nested2', value: { index: 2 } }];
    obj.set('test', {
      test: true,
      info: { topic: 'nested', value: { index: 0 } }
    });

    obj.on('change', function (key, value, options) {
      assert.deepEqual(value, expected[a++]);
      if (a === 3) done();
    });

    obj.set('info', { topic: 'nested', value: { index: 1 } }, { strict: true });
    obj.set('info', { topic: 'nested2', value: { index: '1' } }, { strict: true });
    obj.set('info', { topic: 'nested2', value: { index: 2 } }, { strict: true });
  });

  it('triggers a change event if the object has an emit function', function (done) {
    var obj = Mut(Ev({}));
    obj.on('change:id', function (val) {
      assert.equal(val, 'test');
      done();
    });

    obj.on('change', function (key, val) {
      assert.equal(key, 'id');
      assert.equal(val, 'test');
    });
    obj.set({ id: 'test' });
  });

  it('does not a change event if { silent : true } provided', function (done) {
    var obj = Mut(Ev({}));
    obj.on('change', function (key, val) {
      throw new Error('change event should have not been emitted');
    });
    obj.set({ id: 'test' }, { silent: true });
    obj.set('test', true, { silent: true });
    setTimeout(done, 10);
  });

  it('triggers a change event for each change if the object supports ev', function (done) {
    var obj = Mut(Ev({}));
    var changes = [];
    obj.on('change', function (key, val) {
      changes.push({ key: key, val: val });
      if (changes.length > 1) {
        assert.deepEqual(changes, [{ key: 'id', val: 'test' }, { key: 'id2', val: 'test2' }]);
        done();
      }
    });
    obj.set({ id: 'test', id2: 'test2' });
  });

  it('unset does not fire events for missing attributes', function () {
    var obj = Mut(Ev({}));
    var a = 0;
    var counter = function counter() {
      ++a;
    };
    obj.on('change', counter);
    obj.set('id', 'test');
    assert.deepEqual(obj.attributes, {
      id: 'test'
    });
    assert.equal(a, 1);
    obj.unset('id');
    assert.equal(a, 2);
    obj.unset('id');
    assert.equal(a, 2);
    assert.deepEqual(obj.attributes, {});
  });

  it('"change" triggers with correct options', function (done) {
    var obj = Mut(Ev({}));

    var options0 = {};
    var options1 = {};
    var options2 = {};

    obj.on('change', function (key, value, options) {
      if (obj.get('a') === 0) {
        assert.equal(options, options0);
      } else if (obj.get('a') === 1) {
        assert.equal(options, options1);
      } else if (obj.get('a') === 2) {
        assert.equal(options, options2);
        done();
      }
    });

    obj.on('change:a', function (value, options) {
      if (value === 0) {
        obj.set('a', 1, options1);
      } else if (value === 1) {
        obj.set('a', 2, options2);
      }
    });

    obj.set('a', 0, options0);
  });

});
