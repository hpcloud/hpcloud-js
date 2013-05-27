# HPCloud-JS: A JavaScript library for working with HP Cloud services

This library provides JavaScript bindings for HP Cloud. API-wise, it is
similar to [HPCloud-PHP](http://hpcloud.github.com/hpcloud-php), but
with asynchronous methods.

This has been developed on Node.js only.

## Usage

Authenticating with a username and password:

```javascript
var IdentityServices = require('hpcloud-js').IdentityServices;

var username = 'me';
var password = 'secret';
var tenantId = 12345;
var endpoint = 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0';

var idService = new IdentityServices(endpoint);
idService.setTenantId(tenantId);

idService.authenticateAsUser(username, password, function (err, identity) {
  if (err) { console.error(err); }
  else { console.log(identity.token()); }
});
```
