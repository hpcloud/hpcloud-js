module.exports = Identity;

/**
 * Identity object.
 */
function Identity(jsonObject) {
  this.data = jsonObject;
}


Identity.prototype.token = function () {
  return this.data.access.token.id;
}
Identity.prototype.isExpired = function () {
  var expires = this.data.access.token.expires;
  var expTime = Date.parse(expires);
  return expTime < Date.now();
}


Identity.prototype.tenantId = function () {
  return this.data.access.token.tenant.id;
}
Identity.prototype.tenantName = function () {
  return this.data.access.token.tenant.name;
}
Identity.prototype.tokenDetails = function () {
  return this.data.access.token;
}

Identity.prototype.serviceCatalog = function () {
  return this.data.access.serviceCatalog;
}

Identity.prototype.user = function () {
  return this.data.access.user;
}

Identity.prototype.tenants = function (fn) {
  
}
