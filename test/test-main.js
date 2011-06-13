const _self = require("self");

exports.test_thingy = function(test) {

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
    test.assert (tw.matches(t.html));
  }
}


