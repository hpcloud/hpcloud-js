/**
 * Just the headers and metadata for an object.
 */

module.exports = ProxyObject;

var util = require('util');
var LocalObject = require('./localobject');

function ProxyObject (name) {

}
util.inherits(ProxyObject, LocalObject);

ProxyObject.newFromJSON = function (json) {

}

ProxyObject.newFromRequest = function (response, data) {


}


ProxyObject.prototype.content = function () {
}

ProxyObject.prototype.eTag = function () {
  return this._etag;
}
/**
 * Alias of eTag().
 */
ProxyObject.prototype.md5 = ProxyObject.prototype.eTag;
