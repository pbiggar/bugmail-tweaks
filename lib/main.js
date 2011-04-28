_self = require("self");
_page_mod = require("page-mod");

exports.main = function(options, callback) {
  _page_mod.PageMod({
    include: ["http://mail.google.com/*", "https://mail.google.com/*"],
    contentScriptWhen: 'ready',
    contentScriptFile: [_self.data.url('js/gmail.js')]
  });
}
