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
lineup1 = replacer(/<br>\n( &nbsp;){5} What( &nbsp;){2}\|Old Value( &nbsp;){9} \|New Value<br>\n(-*<wbr>){2}-*<br>\n[\s\S]*<br>\n<br>\n/, '<pre>$&</pre>');
lineup2 = replacer(/<br>\n( &nbsp;){5} What( &nbsp;){2}\|Removed( &nbsp;){10} \|Added<br>\n(-*<wbr>){2}-*<br>\n[\s\S]*?<br>\n<br>\n/, '<pre>$&</pre>');
commentify = function(html, obj) {
  return html.replace(later.recognizer, '$&#c' + obj.comment_num);
}

    

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
  replacers: [rblocks, rbug, lineup1, lineup2],
  parser: function(html) {
    // Regexs that, concated together, parse bug information out of the gmail's HTML
    var start = '^<div id=":\\w+"><div class="im"><a href="https://bugzilla.mozilla.org/';
    var bugnum = 'show_bug.cgi\\?id=(\\d+)';
    var comment_num = '[\s\S]+--- Comment #(\\d+)';
    var author = ' from ([^\\(]+)';
    var username = '.\\((:[^\\)]+)\\)';
    var date = '[\s\S]+(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} PDT) ---'

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
      console.log(b.parser);
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
