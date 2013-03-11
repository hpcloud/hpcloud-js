/* ============================================================================
(c) Copyright 2013 Hewlett-Packard Development Company, L.P.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge,publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
============================================================================ */
/**
 * Represents a remote object -- an object retrieved from object storage.
 *
 * This is a Readable Stream.
 */
module.exports = RemoteObject;

var util = require('util');
var Stream = require('stream');
var ObjectInfo = require('./objectinfo');

/**
 * A Remote Object (from object storage).
 * 
 * @class RemoteObject
 * @constructor
 * @extends Stream
 *
 * @param {String} name The name of the object
 * @param {Object} response A HTTP response for an object.
 */
function RemoteObject(name, response) {
  // I don't think this is strictly necessary.
  Stream.call(this);

  // A readable stream.
  this.readable = true;
  this._paused = false;
  this._data = response;

  var emitter = this;
  // The event handlers for stream.
  function ondata(chunk) {
    emitter.emit('data', chunk);
  }
  function onerror(e) {
    emitter.emit('error', e);
  }
  function onend() {
    emitter.emit('end');
  }
  function onclose(e) {
    emitter.emit('close', e);
  }

  // Pipe these events through.
  this._data.on('data', ondata);
  this._data.on('error', onerror);
  this._data.on('end', onend);
  this._data.on('close', onclose);

  this._objectinfo = ObjectInfo.newFromResponse(name, response);
}
util.inherits(RemoteObject, Stream);

/**
 * Get the ObjectInfo about this object.
 *
 * @method info
 * @return {ObjectInfo} The ObjectInfo object associated with the remote object.
 */
RemoteObject.prototype.info = function () {
  return this._objectinfo;
};


// ==================================================================
// Stream implementation.
//
// Largely, we pass events down to the HTTP IncomingMessage object.
// ==================================================================

/**
 * Close the underlying object.
 *
 * @method destroy
 */
RemoteObject.prototype.destroy = function () {
  this._data.destroy();
};

/**
 * Send a signal to the underlying communication layer requesting no more data
 * be sent.
 *
 * @method pause
 */
RemoteObject.prototype.pause = function () {
  this._paused = true;
  this._data.pause();
};

/**
 * Resumes incoming data.
 *
 * @method resume
 */
RemoteObject.prototype.resume = function () {
  this._paused = false;
  if (this._data) {
    this._data.resume();
  }
};

/**
 * Set the encoding for an object.
 *
 * @method setEncoding
 * @param {String} encoding The encoding to use.
 */
RemoteObject.prototype.setEncoding = function (encoding) {
  this._data.setEncoding(encoding);
};
