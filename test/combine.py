#!/usr/bin/env python
"""Read the test files from this directory and combine them into a JSON file which can be read from JS tests."""

import glob
import json

files = glob.glob("test/msg?")

class Struct(object):
  pass

result = []
for f in files:
  # Read
  contents = file(f).readlines();
  assert len (contents) >= 2
  
  # Parse
  tags = contents[0].rstrip().split(',')
  contents = "\n".join(contents[1:])

  # Create struct
  result.append({"name": f, "html": contents, "tags": tags})


# Write out JSON
result = json.dumps(result)
file("data/test-msgs.js", "w").write(result);


