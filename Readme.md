
# jsonp

Tiny subset of [superagent][]-like API to be used with [jsonp][] requests

## Installation

    $ component install code42day/jsonp

## API

To construct and send request:

```javascript
jsonp('http://example.com')
    .query({
        param1: 'value',
        param2: 3
    }).end(function(data) {
        console.log('This is your json:', data);
    });
```

Please note - you don't add ```callback``` parameter: JSONP takes care of that.

You can call query as many times as needed. New parameters will overwrite the old values.

If URL is already constructed you can also shortened form:

```javascript
jsonp('http://example.com?param1=value&param2=3', function(data) {
    console.log('This is your json:', data);
});
```


## Caveat

Chances are API that you are using already supports [CORS][] - in that case just use superagent.
JSONP is a hackish solution.

Many libraries pretend that JSONP is like any other request: jQuery magically decides between
sending XRC and JSONP based on the presence of ```callback``` parameter. But JSONP does not support
much of the functionality of the standard HTTP request. We just add ```script``` tag tricking
browser into sending HTTP GET. No other HTTP methods are supported, errors handling is limited,
and you have no control over HTTP headers sent with request.

## License

  MIT

[jsonp]: http://en.wikipedia.org/wiki/JSONP "JSON with padding"
[superagent]: https://github.com/visionmedia/superagent "Ajax with less suck"
[CORS]: http://en.wikipedia.org/wiki/Cross-origin_resource_sharing "Cross-origin resource sharing"