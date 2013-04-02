(function(window, document) {
  // Exit if tracking
  // has been opted-out.
  if (window.s_hp_optOut === true) {
    return;
  }

  var loadScript = function (url, callback) {
    var sNew = document.createElement("script");
    sNew.async = true;
    sNew.src = url;
    if ( "function" === typeof(callback) ) {
      sNew.onload = function() {
        callback();
        sNew.onload = sNew.onreadystatechange = undefined; // clear it out to avoid getting called twice
      };
      sNew.onreadystatechange = function() {
        if ( "loaded" === sNew.readyState || "complete" === sNew.readyState ) {
          sNew.onload();
        }
      };
    }
    var s0 = document.getElementsByTagName('script')[0];
    s0.parentNode.insertBefore(sNew, s0);
  };

  window.s_channel = "docs";
  window.s_pageName = document.title;
  window.s_dynamicAccountSelection = true;
  window.s_dynamicAccountList = 'devhphqtestaccount=localhost';
  window.s_dynamicAccountMatch = window.location.hostname;

  if (!window.s_account) {
    window.s_account = 'hphqcloudservices';
  }

  window.s_trackDownloadLinks = true;
  window.s_trackExternalLinks = true;
  window.s_trackInlineStats = true;
  window.s_linkDownloadFileTypes = 'exe,zip,wav,mp3,mov,mpg,avi,doc,pdf,xls,cgi,dot,pot,ppt,wmv,asx';
  window.s_linkInternalFilters = 'hp,compaq,cpqcorp,javascript:';
  window.s_linkLeaveQueryString = false;
  window.s_linkTrackVars = 'None';
  window.s_linkTrackEvents = 'None';

  // Metrics plugin function. Do not remove.
  window.s_hp_doMetricsPlugins = function() {};

  loadScript('https://secure.hp-ww.com/cma/metrics/sc/s_code_remote.js');

// Pass in window, document.
})(this, this.document);