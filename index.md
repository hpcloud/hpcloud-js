---
layout: default
permalink: index.html
---
# HPCloud-JS: A Node.js library for HP Cloud services

Connect Node.js apps to the cloud. Quickly.

## All For You

Our goal is to build a library that meets your needs.

### Make It Snappy

Node.js's strength is its asynchronous processing. And we play to that
strength. We're also working hard to squeeze every last bit of
performance out of the networking layer so your REST calls are blazing
fast.

### Store It In The Cloud

HP Cloud's object storage provides a convenient and secure place to dump
stuff. And we provide the API to put it there... or get it back... or
copy it... or whatever.

### Document, Document, Document

Figuring out how this library works shouldn't require you to read the
code. So we've documented, and documented, and documented.

Every function you should ever need to call is documented. If you find
one that's not, file a bug. We'll fix it. We promise.

### We Use It Too!

The team that created this library uses it in real-world applications.
So we know it works. We write tests because we want to be sure that it
works, and keeps working.

## Example Time

Enough talk, let's see some code!

This little snippet connects to the `IdentityService`,
authenticates, and then connects to `ObjectStorage`. Then it gets a 
list of containers.

    // The IdentityService is necessary to connect to the HP Cloud.
    var hpcloud = require('hpcloud-php');
    
    // Create a new IdentityService service. Give it the URL to your
    // HP CLoud endpoint.
    var is = new hpcloud.IdentityService("https://...");
    // Point it to a particular tenant ID.
    is.setTenantId("12345678");
    
    // Using key and shared secret, log in. There is another function that
    // allows you to use login/password if you wish.
    is.authenticateAsAccount("123accountID", "321Secret", function (e, id) {
      // Now that we have an identity object (id), we can create a new
      // ObjectStorage instance and access our object store. We need to
      // tell it which region to use, since there are multiple regions.
      var store = hpcloud.ObjectStorage.newFromIdentity(id, 'region-a.geo-1');
      // Now that we have a handle to our object store, we can do whatever
      // object storage operations we want. For example, we can get a list of
      // the current containers in this region:
      store.containers(function(e, list) {
        // Do something with the list of containers.
      });
    });

Ready to learn more? Take a look at the API docs, or read through some
of the tests.
