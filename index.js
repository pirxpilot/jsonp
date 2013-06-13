// unique callback number
var callbackId = 0;

function getCallbackName() {
  callbackId += 1;
  return 'jsonp' + callbackId;
}

function prepareUrl(url, params) {
  return url + '?' + Object.keys(params)
    .map(function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

module.exports = function jsonp(url, fn) {
  var self, my = {
    url: url,
    callback_param: 'callback',
    query: {}
  };

  function query(q) {
    Object.keys(q).forEach(function(key) {
      my.query[key] = q[key];
    });
    return self;
  }

  // change options
  function options(opts) {
    if(opts.callback_name)
      my.callback_param = opts.callback_param;
    return self;
  }

  function end(fn) {
    var js, fjs, fnName = getCallbackName();

    window[fnName] = function(json) {
      // cleanup after the call
      delete window[fnName];
      js.parentNode.removeChild(js);
      // execute provided callback
      fn(json);
    };

    my.query[my.callback_param] = fnName;
    js = document.createElement('script');
    js.src = prepareUrl(my.url, my.query);
    js.async = true;
    fjs = document.getElementsByTagName('script')[0];
    fjs.parentNode.insertBefore(js, fjs);
  }

  if (typeof fn === 'function') {
    return end(fn);
  }

  self = {
    query: query,
    options: options,
    end: end
  };

  return self;
};
