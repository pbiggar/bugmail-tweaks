var bug_info_cache = {};

var bz = "https://bugzilla.mozilla.org/";

function replacer(pattern, replacement) {
  return function(html, obj) {
    pattern = new RegExp(pattern.source, "gm");
    return html.replace(pattern, replacement);
  }
};

function bug_info(num) {
  $.ajax({
    url: 'https://api-dev.bugzilla.mozilla.org/latest/bug/' + num + '?include_fields=summary,status',
    accepts: "application/json",
    cache: true,
    contents: "application/json",
    crossDomain: true,
    error: function() { console.log("api error"); },
    success: function() { console.log("success"); },
  });
};

function bug(num, str) {
  if (!str) { str = num; }

  return '<a href="' + bz + 'show_bug.cgi?id=' + num + '" target="_blank">' + str + '</a>';
};

function attachment(num, str) {
  if (!str) { str = num; }
  return '<a href="' + bz + 'attachment.cgi?id=' + num + '" target="_blank">' + str + '</a>';
};



var rblocks = replacer(/Blocks: (\d+)/,
                       'Blocks: ' + bug('$1'));

var rbug = replacer(/([bB]ug:?\s*)(\d+)/,
                    bug('$2', '$1$2'));

// Rewrite bugs in the final column of a table
var rtablebug1 = replacer(/\|(\d+)[^.-]\n/,
                          '|' + bug('$1') + '\n');

var rtablebug2 = replacer(/\|(\d+)[^.-], (\d+)[^.-]\n/,
                          '|' + bug('$1') + ', ' + bug('$2') + '\n');

var rtablebug3 = replacer(/\|(\d+)[^.-], (\d+)[^.-], (\d+)[^.-]([,\n])/,
                          '|' + bug('$1') + ', ' + bug('$2') + ', ' + bug('$3') + '$4');

// Rewrite bugs in the middle column of a table
var rtablebug4 = replacer(/\|(\d+)[^.-](\s+|)/,
                          '|' + bug('$1') + '$2');

var rtablebug5 = replacer(/\|(\d+)[^.-], (\d+)[^.-](\s+|)/,
                          '|' + bug('$1') + ', ' + bug('$2') + '$3');

var rtablebug6 = replacer(/\|(\d+)[^.-], (\d+)[^.-], (\d+)[^.-]([,\s]|)/,
                          '|' + bug('$1') + ', ' + bug('$2') + ', ' + bug('$3') + '$4');

var rtableattachment = replacer(/Attachment #(\d+)/, "Attachment #" + attachment('$1'));


function monospacer(html, obj) {
  // Parse a bugzilla block and wrap pre tags around it. eg:
  //    What    |Removed                     |Added
  //    ----------------------------------------------------------------------------
  //    Summary |Add trychooser syntax for   |Add trychooser syntax for
  //            |SM builds                   |Spidermonkey builds


  // The HTML gmail generates around this can be quite changable, so be
  // robust. We match on HEADER+BARS+ROWS*. We stop when there is a newline
  // with no '&nbsp;'s (not too hard since '.' doesn't match newlines in JS).

  var header1 = /( &nbsp;){5} What( &nbsp;){2}\|Old Value( &nbsp;){9} \|New Value/;
  var header2 = /( &nbsp;){5} What( &nbsp;){2}\|Removed( &nbsp;){10} \|Added/;
  var bars = /(-*<wbr>){2}-*/;
  var row = /.*nbsp.*/;


  // A simple line parser. When we see a header we open a PRE tag, and we
  // close it again once we no longer match a row.

  result = "";
  var started = false;
  var readd_div = false;

  lines = html.split(/<br>\n/);
  for each (var line in lines) {

    if (line.match(header1) || line.match(header2)) {
      // heading
      started = true;
      result += '<pre>' + line + '\n';
    } else if (started) {
      if (line.match(bars) || line.match(row)) {
        // rows
        
        // Special case: sometimes gmail closes a <div> in the middle of the
        // table, which closes the pre. I don't like special-casing this, but
        // the nicer way (wrapping each line in a <pre>) doesn't really fix
        // the problem without a hack of it's own, and also leads to bad spacing.
        if (line.match(/<\/div>/)) {
          readd_div = true;
          line = line.replace(/<\/div>/, '');
        }

        result += line + '\n';

        // spacial case
      } else {
        // Finished
        if (readd_div) {
          result += '</pre></div>\n' + line;
        } else {
          result += '</pre>\n' + line;
        }
        started = false;

      }
    } else {
      // Unrelated
      result += line + '<br>\n';
    }
  }

  return result;
}

function linkComments(html, data) {
  if (!data)
    return html;

  var linkedComment = '<a href="' + bz + 'show_bug.cgi?id=' + data.bug_num + '#c' 
                    + data.comment_num + '" target="_blank">Comment #' + data.comment_num + '</a>';

  var result = html.replace(/--- Comment #(\d+)/, '--- ' + linkedComment);
  return result;
}

function comment_parser(html) {
  // var comment_num = '--- Comment #(\\d+)';
  // var author = ' from (.+?)';
  // var username = '[(\\[](.+?)[)\\]]|()';
  // var email = ' &lt;.+?href="(.+?)".+?&gt; ';
  // var date = '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} \\w+) ---';
  // var anything = '[\\s\\S]*?';

  var data = {};
  data.bug_num = /show_bug.cgi\?id=(\d+)/.exec(html)[1];

  var commentMatch = /--- Comment #(\d+)/.exec(html);
  if (commentMatch)
    data.comment_num = commentMatch[1];

  return data;
}

var tweaker = {

  parse: function(html) {
    for each (var p in this.parsers) {
      var obj = p(html);
      if (obj) {
        return obj;
      }
    }
    return null;
  },

  replace: function(html, data) {
    for each (var r in this.replacers) {
      html = r(html, data);
    }
    return html;
  },

  replacers: [rblocks, rbug, monospacer, rtablebug1, rtablebug2, rtablebug3, rtablebug4, 
              rtablebug5, rtablebug6, linkComments, rtableattachment],

  parsers: [comment_parser]
};


function tweak (msg) {
  if (msg.getFromAddress().indexOf('bugzilla-daemon') === -1)
    return;
  msg = msg.getContentElement();
  var html = msg.innerHTML;
  bz = /(http.+?)show_bug\.cgi/.exec(html)[1];

  var data = tweaker.parse(html);
  var new_ = tweaker.replace(html, data);
  if (html != new_) {
    msg.innerHTML = new_;
  }

  if (tweaker.updateHtml)
    tweaker.updateHtml(msg, data);
}
function loadGmonkey() {
  if (unsafeWindow.gmonkey) {
    unsafeWindow.gmonkey.load("2.0", function(gmail) {
      var msg = new gmail.GmailMessage();
      gmail.registerMessageViewChangeCallback(function (message) {
        if (!message.isCollapsed() && !message.bugmail_tweaked) {
          tweak(message);
          message.bugmail_tweaked = true;
        }
      });
    });
  }
}
self.on('message', loadGmonkey);