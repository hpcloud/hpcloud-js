YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ACL",
        "Container",
        "Futil",
        "Identity",
        "IdentityServices",
        "ObjectInfo",
        "RemoteObject",
        "Subdir",
        "Transport"
    ],
    "modules": [
        "hpcloud"
    ],
    "allModules": [
        {
            "displayName": "hpcloud",
            "name": "hpcloud",
            "description": "The HP Cloud JS module provides Node.js APIs for HP Cloud's services.\n\nHP Cloud is based on OpenStack, but has a number of extensions, such as\nCDN integration and Database as a Service (DBaaS). This library provides\na consistent, tested interface to HP Cloud's flavor of OpenStack. Many of\nthese libraries will also work with vanilla OpenStack.\n\nIn general, working with this library is done like this:\n\n- Use the IdentityServices library to authenticate to the HP Cloud.\n- Pass the resulting Identity object to one or more of the service\n  libraries to work with those services.\n\nFor example, to list the containers you have in Object Storage, you might\ndo something like this:\n\n    // The IdentityService is necessary to connect to the HP Cloud.\n    var IdentityService = require('hpcloud-js').IdentityServices;\n    \n    // These two are for ObjectStorage.\n    var ObjectStorage = require('hpcloud-js').ObjectStorage;\n    var Container = require('hpcloud-js').ObjectStorage.Container;\n    \n    // Create a new IdentityService service. Give it the URL to your\n    // HP CLoud endpoint.\n    var is = new IdentityService(\"https://...\");\n    // Point it to a particular tenant ID.\n    is.setTenantId(\"12345678\");\n    \n    // Using key and shared secret, log in. There is another function that\n    // allows you to use login/password if you wish.\n    is.authenticateAsAccount(\"123accountID\", \"321Secret\", function (e, id) {\n      // Now that we have an identity object (id), we can create a new\n      // ObjectStorage instance and access our object store. We need to\n      // tell it which region to use, since there are multiple regions.\n      var store = ObjectStorage.newFromIdentity(id, 'region-a.geo-1');\n      // Now that we have a handle to our object store, we can do whatever\n      // object storage operations we want. For example, we can get a list of\n      // the current containers in this region:\n      store.containers(function(e, list) {\n        // Do something with the list of containers.\n      });\n    });\n\nThe above is a good example of the typical patterns used for working with the\nHP Cloud bindings. As with most good Node.js libraries, the HPCloud-JS library\nis asynchronous wherever possible.\n\nFor more good examples of working with the HPCloud-JS APIs, see the tests in\nthe `test/` directory. For example, `test/test-objectstorage.js` exercises\nthe entire ObjectStorage API.\n\n## Interested in Contributing?\n\nThis project is open source, and we welcome new contributors. Just drop by\nthe issue queue and introduce yourself."
        }
    ]
} };
});