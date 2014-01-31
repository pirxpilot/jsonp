var load = require('load');

// unique callback number
var callbackId = 0;

function getCallbackName() {
  callbackId += 1;
  return 'jsonp' + callbackId;
}

function prepareUrl(url, params) {
  var query = [];
  for (key in params) {
    query.push(key + '=' + encodeURIComponent(params[key]));
  }
  return url + '?' + query.join('&');
}

module.exports = function jsonp(url, fn) {
  var self, my = {
    url: url,
    query: {}
  };

  function query(q) {
    for (key in q) {
      my.query[key] = q[key]
    }
    return self;
  }

  function end(fn) {
    var js, fnName = getCallbackName();

    window[fnName] = function(json) {
      // cleanup after the call
      delete window[fnName];
      js.parentNode.removeChild(js);
      // execute provided callback
      fn(json);
    };

    my.query.callback = fnName;
    js = load(prepareUrl(my.url, my.query));
  }

  if (typeof fn === 'function') {
    return end(fn);
  }

  self = {
    query: query,
    end: end
  };

  return self;
};
