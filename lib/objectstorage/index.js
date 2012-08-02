exports.version = "0.1.0";

exports.Container = require('./container');
exports.LocalObject = require('./localobject');
exports.RemoteObject = require('./remoteobject');
exports.ProxyObject = require('./proxyobject');


exports.newFromIdentity = newFromIdentity;
exports.ObjectStorage = ObjectStorage;

/**
 * Create a new ObjectStorage instance from an IdentityServices
 * Identity.
 *
 * @param {Identity} identity
 *   An identity with a service catalog.
 * @param {Function} fn
 *   A callback, which will receive an Error (if applicable) and an
 *   ObjectStorage instance.
 */
function newFromIdentity(identity, fn) {

}

/**
 * Given an authentication token and an endpoint, create an
 * ObjectStorage instance.
 *
 * @param {string} authToken
 *   An authentication token. These typically are supplied by Identity
 *   Services.
 * @param {string} endpoint
 *   An endpoint base URL.
 */
function ObjectStorage(authToken, endpoint) {
}

ObjectStorage.prototype.useCDN = function (cdn) {}
ObjectStorage.prototype.hasCDN = function (name) {}
ObjectStorage.prototype.cdnUrl = function (name, useSSL) {}
ObjectStorage.prototype.token = function () {}
ObjectStorage.prototype.url = function () {}
ObjectStorage.prototype.containers = function (limit, marker) {}
ObjectStorage.prototype.container = function (name) {}
ObjectStorage.prototype.hasContainer = function (name) {}
ObjectStorage.prototype.createContainer = function (name, acl, metadata) {}
ObjectStorage.prototype.updateContainer = function (name, acl, metadata) {}
ObjectStorage.prototype.changeContainerACL = function (containerName, acl) {}
ObjectStorage.prototype.deleteContainer = function (containerName) {}
ObjectStorage.prototype.accountInfo = function () {}
