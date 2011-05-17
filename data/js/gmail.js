if (!this.bugmail) this.bugmail = {};
if (!this.bugmail.gmail) {

  /* Handles loading the message into gmail below. */
  function updateConversation(cv, callback) {
    var msgs = cv.getElementsByClassName("ii gt");
    for (var i in msgs) {
      if (msgs[i]) {
        msg = msgs[i];
        if (!msg.bugmail_tweaked && msg.innerHTML) {
          callback(msg);
          msg.bugmail_tweaked = true;
        }
      }
    }
  }

  function tweaker(gmail, callback) {
    try {
      if (gmail.getActiveViewType() == "cv") {
        elem = gmail.getActiveViewElement();
        updateConversation(elem, callback);
     }
    } catch (e) {
      console.log("Error which tweaking");
      console.exception(e);
    }
  };

  function load (window, callback) {
    try {
      if ("gmonkey" in window) {
        window.gmonkey.load("2.0", function(gmail) { window.setInterval(tweaker, 500, gmail, callback); });
      } else {
        console.log("No gmonkey here");
      }
    } catch (e) {
      console.log("Error loading tweaker");
      console.exception(e);
    }
  }

  this.bugmail.gmail = {load: load};
}
