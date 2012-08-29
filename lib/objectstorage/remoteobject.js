module.exports = RemoteObject;

var util = require('util');
var LocalObject = require('./localobject');

function RemoteObject(name) {

}

util.inherits(RemoteObject, LocalObject);

RemoteObject.prototype.content = function(fn) {

}
