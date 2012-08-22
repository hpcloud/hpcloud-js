/*!
 *
 */
HTTPS = require('https');
Futil = require('./futil');

module.exports = Transport = {};

/**
 * Do an HTTPS request.
 *
 * This performs a simple HTTPS request, and then
 * executes the callback, passing the response object into the
 * callback.
 *
 * @param {object} opts
 *   An object containing, at minimum, a parsed URL.
 *   To create a new opts, use URL.parse(url).
 * @param {string} body (Optional)
 *   The body o fthe request.
 * @param {Function} fn
 *   A callback function. This receives an Error (on error), a Response,
 *   and (if present) the data as a string.
 */
Transport.doRequest = function(opts, body, fn) {

  var a = Futil.argsWithFn(arguments, ['opts', 'body', 'fn']);
  fn = a.fn;
  opts = a.opts;
  body = a.body;

  // Define the request.
  var req = HTTPS.request(opts, function (response) {
    // We accept only status codes from 200-399.
    if (response.statusCode > 199 && response.statusCode < 400) {
      var responseData = '';
      response.on('data', function (bytes) {
        responseData += bytes;
      });
      response.on('end', function() {
        fn(false, response, responseData);
      });
    }
    else {
      console.log("FAILED with HTTP status code %d", response.statusCode);
      var e = new Error('HTTP Error ' + response.statusCode);
      e.statusCode = response.statusCode;
      fn(e);
    }
  });

  // FIXME: Use better error handling.
  req.on('error', function (e) {
    console.log('FAILED outside of HTTP: ' + e.message);
    var err = new Error('Non-HTTP error: ' + e.message);
    err.statusCode = 0;
    fn(err);
  });

  // Write the body and trigger the request.
  if (body) {
    req.write(body);
  }
  req.end();

}

