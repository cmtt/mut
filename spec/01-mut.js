describe('Mut', function () {

  /* could check.. no changes being emitted, previousValues */

  it ('returns the provide scope', function () {
    var obj = {
      id : '2'
    };
    var retval = Mut(obj);
    assert.equal(retval.id, '2');
  });

  it ('has set, get functions and an attributes object', function () {
    var obj = {};
    Mut(obj);

    assert.equal(typeof obj.set,'function');
    assert.equal(typeof obj.get,'function');
    assert.equal(typeof obj.hasChanged,'function');
    assert.ok(typeof obj.attributes === 'object');
  });

  it ('sets and gets a value', function () {
    var obj = {};
    Mut(obj);
    // obj.set({ id : 'test'});
    obj.set('id', 'test');
    assert.equal(obj.attributes.id, 'test');
    assert.equal(obj.get('id'), 'test');
  });

  it ('sets and gets a value by hash', function () {
    var obj = {};
    Mut(obj);
    obj.set({ id : 'test'});
    assert.equal(obj.attributes.id, 'test');
    assert.equal(obj.get('id'), 'test');
  });

  it('triggers a change event if the object supports ev', function (done) {
    var obj = {};
    Mut(obj);
    Ev(obj);
    obj.bind('change', function (key, val) {
      assert.equal(key, 'id');
      assert.equal(val, 'test');
      done();
    });
    obj.set({ id : 'test'});
  });

  it('triggers a change event for each change if the object supports ev', function (done) {
    var obj = {};
    Mut(obj);
    Ev(obj);
    var changes = [];
    obj.bind('change', function (key, val) {
      changes.push({ key : key, val : val });
      if (changes.length > 1) {
        assert.deepEqual(changes, [
          { key : 'id', val : 'test' },
          { key : 'id2', val : 'test2'}
        ]);
        done();
      }
    });
    obj.set({ id : 'test', id2 : 'test2' });

  });
});
