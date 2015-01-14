function Mut (scope) {
  (function () {
    /**
     * @private
     */

    scope.attributes = {};
    scope.changes = {};
    scope.previousValues = {};

    /**
     * @function
     */

    scope.set = function (attrId, value, options) {
      var previousValue;
      if (typeof attrId === 'object') {
        var settings = arguments[0];
        options = arguments[1] || {};
        for (var property in settings) {
          if (settings.hasOwnProperty(property)) {
            value = settings[property];
            previousValue = scope.attributes[property];
            if (previousValue !== value) {
              scope.previousValues[property] = previousValue;
              scope.attributes[property] = value;
              scope.changes[property] = true;

              /** Trigger a change event */
              if ( typeof scope.trigger === 'function' && options.silent !== true) {
                scope.trigger('change', property, settings[property]);
              }

            }
          }
        }
        return;
      }
      options = options || {};
      previousValue = scope.attributes[attrId];
      if (previousValue === value) {
        return;
      }
      scope.attributes[attrId] = value;
      scope.changes[attrId] = true;
      if (typeof scope.trigger === 'function' && options.silent !== true) {
        scope.trigger('change', attrId, value);
      }
    };

    /**
     * @function
     */

    scope.hasChanged = function (attrId) {
      return (scope.changes[attrId] === true);
    };

    /**
     * @function
     */

    scope.get = function (attrId) {
      if (typeof scope.attributes[attrId] === 'undefined') {
        // throw new Error (ERR_INVALID_ATTRIBUTE);
        return;
      }
      return scope.attributes[attrId];
    };

  })(scope);

  return scope;
}

module.exports = Mut;
