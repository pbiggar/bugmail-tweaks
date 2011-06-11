var _page_mod = require("page-mod");
var _self = require("self");

exports.main = function(options, callback) {
  try{
  _page_mod.PageMod({
    include: ["http://mail.google.com/*", "https://mail.google.com/*"],
    contentScriptWhen: 'ready',
    contentScriptFile: [
      _self.data.url("js/jquery.min.js"), 
      _self.data.url("js/gmail.js"), 
      _self.data.url("js/bzmail.js"),
      _self.data.url("js/load.js")
    ],
  });
  } catch (e) { console.log("loading error"); console.trace(e); }
}
