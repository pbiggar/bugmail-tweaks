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

    var data = tw.parse(t.html);

    // Check that we haven't mistagged
    if (data) {
      for each (tag in ["comment"]) {
        test.assertNotEqual (t.tags.indexOf(tag), -1);
      }
    }

    // Check parsing
    if ("comment" in t.tags) {
      test.assert (data);
    }

    // Check replacers do something
    for each (var tag in t.tags)
    {
      var tag = "comment";
      var replacer = tw['replace_' + tag];
      var new_ = replacer(t.html, data);
      test.assertNotEqual(new_, t.html);
    }
  }
}


