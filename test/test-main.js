const main = require("main");
const self = require("self");

exports.test_test_run = function(test) {
  test.pass("Unit test running!");
};

exports.test_id = function(test) {
  test.assert(require("self").id.length > 0);
};

exports.test_thingy = function(test) {

  // Access the code
  require("

  // Extract the tests
  json = self.data.load("test-msgs.js");
  tests = JSON.parse(json);

  // Each tag names a function which should trigger a change in the contents
  for (var i in tests) {
    var contents = tests[i].contents;
    var tags = data[i].tags;
  }

  test.assertEqual(5,5);
}


