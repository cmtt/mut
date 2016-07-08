'use strict';

var assign = require('object-assign');
var deepEqual = require('deep-equal');

/**
 * @method Mut
 * @param {*} scope
 */

function Mut (scope) {
  if (!(this instanceof Mut)) return new Mut(scope);

  scope._changed = {};
  scope._previousAttributes = {};
  scope.attributes = {};

  /**
   * Returns whether the specified attribute is set
   * @method has
   * @param {string} attrId
   * @return {boolean}
   */

  scope.has = function (attrId) { return attrId in scope.attributes; };

  /**
   * Returns whether the provided attribute has changed
   * @method hasChanged
   * @param {string} attrId
   * @return {boolean}
   */

  scope.hasChanged = function (attrId) { return !!scope._changed[attrId]; };

  /**
   * Returns the value of an attribute
   * @method get
   * @param {string} attrId
   * @return {*}
   */

  scope.get = function (attrId) { return scope.attributes[attrId]; };

  /**
   * Returns the previous value of an attribute since the last "change"
   * event
   * @method previous
   * @param {string} attrId
   * @return {*}
   */

  scope.previous = function (attrId) {
    return scope._previousAttributes[attrId];
  };

  /**
   * Sets the specified attribute, firing a "change" attribute if the scope
   * has an "emit" or "trigger" method.
   * @method set
   * @param {string} attrId
   * @param {*} value
   * @param {object} options
   */

  scope.set = function (attrId, value, options) {
    if (typeof attrId === 'object') { options = value; }
    options = options || {};

    var _previousAttributes = assign({}, scope.attributes);
    scope._previousAttributes = _previousAttributes;

    var changed = {};
    var emitter = scope.emit || scope.trigger;
    var opt = { strict: !!options.strict }; // deep-equal
    var silent = options.silent === true;

    /**
     * @method setAttribute
     * @param {string} id
     * @param {*} val
     * @private
     */

    var setAttribute = function (id, val) {
      var hasChanged = !deepEqual(_previousAttributes[id], val, opt);
      scope.attributes[id] = val;
      if (hasChanged) {
        changed[id] = true;
      }
    };

    if (typeof attrId === 'object') {
      var attributes = attrId;
      for (var key in attributes) {
        setAttribute(key, attributes[key]);
      }
    } else {
      setAttribute(attrId, value);
    }

    scope._changed = changed;

    if (silent !== true && typeof emitter === 'function') {
      for (var id in changed) {
        emitter.call(scope, 'change', id, scope.attributes[id], options);
        emitter.call(scope, 'change:' + id, scope.attributes[id], options);
      }
    }
  };

  /**
   * Removes the specified attribute and fires a "change" event.
   * @method unset
   * @param {string} attrId
   */

  scope.unset = function (attrId, options) {
    var hasAttribute = scope.has(attrId);
    options = options || {};
    var silent = options.silent === true;
    delete scope._previousAttributes[attrId];
    delete scope.attributes[attrId];

    scope._changed[attrId] = true;

    var emitter = scope.emit || scope.trigger;
    if (hasAttribute && !silent && typeof emitter === 'function') {
      emitter.call(scope, 'change', attrId, void 0, options);
    }
  };

  return scope;
}

module.exports = Mut;
