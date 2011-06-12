const _self = require("self");

exports.test_thingy = function(test) {

  // Extract the tests
  var json = _self.data.load("test-msgs.js");
  var tests = JSON.parse(json);

  // Fetch the content script
  var bzmail = _self.data.load("js/bzmail.js");
  bzmail = eval(bzmail);

  // Each tag names a function which should trigger a change in the contents
  for (var i in tests) {
    var html = tests[i].contents;
    var tags = tests[i].tags;

    // Check that each replacer does something
    for (var i in bzmail.bugmails) {
      var b = bzmail.bugmails[i];
      if (b.matches(html)) {
        var obj = b.parser ? b.parser(html) : null;


        test.assert(obj != null || b.parser == null, "Parser didn't return anything");
        for (r in b.replacers) {
          var old = html;
          var html = b.replacers[r](html, obj);
        }

        test.assert(old != html, "Replacer didn't replace anything")

        // Don't run multiple parsers over it, handle that use case by inheritence.
        break;
      }
    }
  }
}


