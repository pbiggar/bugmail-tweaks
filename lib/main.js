var pageMod = require("page-mod");
var data = require("self").data;

exports.main = function(options, callback) {
  pageMod.PageMod({
    include: /.+mail\.google\.com\/mail\/.+shva=.+/,
    contentScriptWhen: 'end',
    contentScriptFile: [
      data.url("js/bzmail.js")
    ],
    onAttach: function(worker) {
    	worker.postMessage('ready');
    }
  });
}
