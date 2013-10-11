
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("code42day-load/index.js", Function("exports, require, module",
"module.exports = function load(src, async) {\n\
  var s = document.createElement('script');\n\
  s.src = src;\n\
  if (typeof async === 'boolean') {\n\
    s.async = async;\n\
  }\n\
  (document.head || document.body).appendChild(s);\n\
  return s;\n\
};\n\
//@ sourceURL=code42day-load/index.js"
));
require.register("jsonp/index.js", Function("exports, require, module",
"var load = require('load');\n\
\n\
// unique callback number\n\
var callbackId = 0;\n\
\n\
function getCallbackName() {\n\
  callbackId += 1;\n\
  return 'jsonp' + callbackId;\n\
}\n\
\n\
function prepareUrl(url, params) {\n\
  return url + '?' + Object.keys(params)\n\
    .map(function(key) {\n\
      return key + '=' + encodeURIComponent(params[key]);\n\
    })\n\
    .join('&');\n\
}\n\
\n\
module.exports = function jsonp(url, fn) {\n\
  var self, my = {\n\
    url: url,\n\
    query: {}\n\
  };\n\
\n\
  function query(q) {\n\
    Object.keys(q).forEach(function(key) {\n\
      my.query[key] = q[key];\n\
    });\n\
    return self;\n\
  }\n\
\n\
  function end(fn) {\n\
    var js, fnName = getCallbackName();\n\
\n\
    window[fnName] = function(json) {\n\
      // cleanup after the call\n\
      delete window[fnName];\n\
      js.parentNode.removeChild(js);\n\
      // execute provided callback\n\
      fn(json);\n\
    };\n\
\n\
    my.query.callback = fnName;\n\
    js = load(prepareUrl(my.url, my.query));\n\
  }\n\
\n\
  if (typeof fn === 'function') {\n\
    return end(fn);\n\
  }\n\
\n\
  self = {\n\
    query: query,\n\
    end: end\n\
  };\n\
\n\
  return self;\n\
};\n\
//@ sourceURL=jsonp/index.js"
));
require.alias("code42day-load/index.js", "jsonp/deps/load/index.js");
require.alias("code42day-load/index.js", "jsonp/deps/load/index.js");
require.alias("code42day-load/index.js", "load/index.js");
require.alias("code42day-load/index.js", "code42day-load/index.js");