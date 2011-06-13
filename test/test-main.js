const _self = require("self");

exports.test_bzmail = function(test) {

  // Extract the tests
  var json = _self.data.load("test-msgs.js");
  var tests = JSON.parse(json);

  // Fetch the content script
  var bzmail = _self.data.load("js/bzmail.js");
  bzmail = eval(bzmail);

  var tw = bzmail.tweaker;

  // Each tag names a function which should trigger a change in the contents
  for each (var t in tests) {
    console.log(t.name);

    // Check all of our messages are matched
    test.assert (tw.matches(t.html));

    var obj = tw.parse(t.html);

    // Check that we haven't mistagged
    if (obj) {
      for each (tag in ["comment"]) {
        test.assert (tag in t.tags);
      }
    }

    // Check comments
    if ("comment" in t.tags) {
      test.assert (obj);
    }
  }
}


