var assert = require('assert');
//var IdentityServices = require('../lib/identityservices');
var conf = require('./config');

assert.notEqual(0, conf.identity.endpoint.length);

//var idservice = new IdentityServices();
