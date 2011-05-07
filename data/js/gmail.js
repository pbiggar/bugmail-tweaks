/*
 * Tweaks to gmail to make bugmail more tolerable.
 */

function is_bugmail(html) {
  return html.match(this.recognizer) != null;
}

function bug(num) {
  return '<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug + '">' + bug + '</a>';
}

first = {
  name: 'first mail',
  recognizer: '^<div id=":\\w+"><a href="https://bugzilla.mozilla.org/show_bug.cgi\\?id=\\d+',
  matches: is_bugmail,
  tweak: function(html) {
    html = html.replace(/Blocks: (\d+)/, 'Blocks: <a href="https://bugzil.la/$1">$1</a>', 'm');
    html = html.replace(/([bB]ug:?\s*)(\d+)/, '<a href="https://bugzil.la/$2">$1$2</a>', 'm');
    return html;
  }
};

later = {
  name: 'later mail',
  recognizer: '^<div id=":\\w+"><div class="im"><a href="https://bugzilla.mozilla.org/show_bug.cgi\\?id=\\d+',
  matches: is_bugmail,
  tweak: function(html) {
    // Regexs that, concated together, parse bug information out of the gmail's HTML
    var start = '^<div id=":\\w+"><div class="im"><a href="https://bugzilla.mozilla.org/';
    var bugnum = 'show_bug.cgi\\?id=(\\d+)';
    var comment_num = '.+--- Comment #(\\d+)';
    var author = ' from ([^\\(]+)';
    var username = '.\\((:[^\\)]+)\\)';
    var date = '.+(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} PDT) ---'

    // Read the data first.
    var re = start + bugnum + comment_num + author + username + date;
    result = html.match(re, 'm');


    console.log(html);
    console.log(re);
    console.log(result);

    return result;
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
      html = b.tweak(html);
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



