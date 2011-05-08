/*
 * Tweaks to gmail to make bugmail more tolerable.
 */

function is_bugmail(html) {
  return html.match(this.recognizer) != null;
}

var bz = "https://bugzilla.mozilla.org/";

function bug(num, str) {
  if (!str) { str = num; }
  return '<a href="' + bz + 'show_bug.cgi?id=' + num + '">' + str + '</a>';
}

function replacer(pattern, replacement) {
  return function(html, obj) {
    pattern = new RegExp(pattern.source, "gm");
    return html.replace(pattern, replacement);
  }
}

rblocks = replacer(/Blocks: (\d+)/, 'Blocks: ' + bug('$1'));
rbug = replacer(/([bB]ug:?\s*)(\d+)/, bug('$2', '$1$2'));
lineup = replacer(/<br>\n( &nbsp;){5} What( &nbsp;){2}\|Old Value( &nbsp;){9} \|New Value<br>\n(-*<wbr>){2}-*<br>\n[\s\S]*<br>\n<br>\n/, '<pre>$&</pre>');


first = {
  name: 'first mail',
  recognizer: '^<div id=":\\w+"><a href="https://bugzilla.mozilla.org/show_bug.cgi\\?id=\\d+',
  matches: is_bugmail,
  replacers: [rblocks, rbug],
};

later = {
  name: 'later mail',
  recognizer: '^<div id=":\\w+"><div class="im"><a href="https://bugzilla.mozilla.org/show_bug.cgi\\?id=\\d+',
  matches: is_bugmail,
  replacers: [rblocks, rbug, lineup],
  parser: function(html) {
    // Regexs that, concated together, parse bug information out of the gmail's HTML
    var start = '^<div id=":\\w+"><div class="im"><a href="https://bugzilla.mozilla.org/';
    var bugnum = 'show_bug.cgi\\?id=(\\d+)';
    var comment_num = '.+--- Comment #(\\d+)';
    var author = ' from ([^\\(]+)';
    var username = '.\\((:[^\\)]+)\\)';
    var date = '.+(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} PDT) ---'

    // Read the data first.
    var re = start + bugnum + comment_num + author + username + date;
    return html.match(re, 'm');
  }
};

bugmails = [first, later];

function tweak(msg) {
  console.log("tweaking");
  var html = msg.innerHTML;

  for (var i in bugmails) {
    b = bugmails[i];
    if (b.matches(html)) {
      console.log("Matches: " + b.name);
      console.log("old: " + html);
      obj = b.parser ? b.parser(html) : null;
      for (r in b.replacers) {
        html = b.replacers[r](html, obj);
      }

      // Don't run multiple parsers over it, handle that use case by inheritence.
      console.log("new: " + html);
      msg.innerHTML = html;
      return;
    }
  }

  console.log("not bugmail");
}


/* Handles loading the message into gmail below. */
function updateConversation(cv) {
  var msgs = cv.getElementsByClassName("ii gt");
  try {
    for (var i in msgs) {
      if (msgs[i])
      {
        msg = msgs[i];
        if (!msg.bugmail_tweaked)
        {
          if (msg.innerHTML) {

            tweak(msg);


          }
          msg.bugmail_tweaked = true;
        }
      }
    }
  } catch (e) {
    console.log("error tweaking");
    console.exception(e);
  }

  setTimeout(updateConversation, 3000, cv);
}


function tweaker(gmail) {
  try {
    if (gmail.getActiveViewType() == "cv") {
      console.log("got it");
      elem = gmail.getActiveViewElement();
      updateConversation(elem);
   }
    else {
      console.log("loading", gmail);
      console.log(gmail.getActiveViewType());
      setTimeout(tweaker, 3000, gmail);
    }
  } catch (e) {
    console.log("error");
    console.exception(e);
  }
}

try {
  if ("gmonkey" in window) {
    window.gmonkey.load("1.0", tweaker);
  } else {
    console.log("No gmonkey here");
  }
} catch (e) {
    console.log("Error loading bugmail tweaks");
    console.exception(e);
}



