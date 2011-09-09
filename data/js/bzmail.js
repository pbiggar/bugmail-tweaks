// Module setup
if (!this.bugmail) { this.bugmail = {}; }
if (!this.bugmail.bzmail) {
  this.bugmail.bzmail = (function ()
{

  var my = {};

  var bug_info_cache = {};

  var bz = "https://bugzilla.mozilla.org/";

  function replacer (pattern, replacement) {
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

  function bug (num, str) {
    if (!str) { str = num; }

    return '<a href="' + bz + 'show_bug.cgi?id=' + num + '" target="_blank">' + str + '</a>';
  };



  var rblocks = replacer(/Blocks: (\d+)/,
                         'Blocks: ' + bug('$1'));

  var rbug = replacer(/([bB]ug:?\s*)(\d+)/,
                      bug('$2', '$1$2'));

  // Rewrite bugs in the final column of a table
  var rtablebug1 = replacer(/\|(\d+)\n/,
                            '|' + bug('$1') + '\n');

  var rtablebug2 = replacer(/\|(\d+), (\d+)\n/,
                            '|' + bug('$1') + ', ' + bug('$2') + '\n');

  var rtablebug3 = replacer(/\|(\d+), (\d+), (\d+)([,\n])/,
                            '|' + bug('$1') + ', ' + bug('$2') + ', ' + bug('$3') + '$4');

  // Rewrite bugs in the middle column of a table
  var rtablebug4 = replacer(/\|(\d+)(\s+|)/,
                            '|' + bug('$1') + '$2');

  var rtablebug5 = replacer(/\|(\d+), (\d+)(\s+|)n/,
                            '|' + bug('$1') + ', ' + bug('$2') + '$3');

  var rtablebug6 = replacer(/\|(\d+), (\d+), (\d+)([,\s]|)/,
                            '|' + bug('$1') + ', ' + bug('$2') + ', ' + bug('$3') + '$4');


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

  function commentify(html, data) {
    if (!data)
      return html;

    var result = html.replace(tweaker.recognizers[1], '$&#c' + data.comment_num);
    console.log(result);
    return result;
  }

  function comment_parser(html) {

    var anything = '[\\s\\S]+';
    var start = '^<div id=":\\w+"><div class="im"><a href="https://bugzilla.mozilla.org/';
    var bugnum = 'show_bug.cgi\\?id=(\\d+)';
    var comment_num = '--- Comment #(\\d+)';
    var author = ' from ([^\\(]+)';
    var username = '.\\((:[^\\)]+)\\)';
    var date = '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} PDT) ---'

    var re = start + bugnum + anything + comment_num + author + username + anything + date;
    var result = html.match(re, 'm');

    if (!result) {
      return null;
    }

    return { 
      bugnum: result[1],
      comment_num: result[2],
      author: result[3],
      username: result[4],
      date: result[5],
    };
  }

  var tweaker = {

    matches: function (html) {
      for each (var r in this.recognizers) {
        if (html.match(r)) {
          return true;
        }
      }
      return false;
    },

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


    recognizers: [
       '^<div id=":\\w+"><a href="https://bugzilla.mozilla.org/show_bug.cgi\\?id=\\d+',
       '^<div id=":\\w+"><div class="im"><a href="https://bugzilla.mozilla.org/show_bug.cgi\\?id=\\d+'
         ],

    replacers: [rblocks, rbug, monospacer, rtablebug1, rtablebug2, rtablebug3, rtablebug4, rtablebug5, rtablebug6, commentify],

    parsers: [comment_parser],

    replace_comment: commentify,
  };


  function tweak (msg) {
    console.log("tweaking");
    var old = msg.innerHTML;

    if (tweaker.matches(old)) {
      var data = tweaker.parse(old);
      var new_ = tweaker.replace(old, data);
      if (old != new_) {
        console.log("old: " + old);
        console.log("new: " + new_);
        msg.innerHTML = new_;
      }

      if (tweaker.updateHtml)
        tweaker.updateHtml(msg, data);

    } else {
      console.log("not bugmail");
    } 
  }

  my.translate = tweak;
  my.tweaker = tweaker;

  return my;


})();}
