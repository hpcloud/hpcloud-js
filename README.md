# HPCloud-JS: A JavaScript library for working with HP Cloud services

## Usage

Authenticating with a username and password:

```javascript
require('hpcloud');

var username = 'me';
var password = 'secret';
var tenantId = 12345
var endpoint = 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0';

var idService = new IdentityServices(endpoint);

idService.authenticateAsUser(username, password, tenantId, function (success, identity) {
  console.log(identity.token());
});
```


