const _self = require("self");

exports.test_thingy = function(test) {

  // Extract the tests
  var json = _self.data.load("test-msgs.js");
  var tests = JSON.parse(json);

  // Fetch the content script
  var content = _self.data.load("js/bzmail.js");
  content = eval(content);

  console.log(this.bugmail);

  // Each tag names a function which should trigger a change in the contents
  for (var i in tests) {
    var contents = tests[i].contents;
    var tags = tests[i].tags;
  }



  test.assertEqual(5,5);
}


