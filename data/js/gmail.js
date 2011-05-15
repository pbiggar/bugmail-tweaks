if (!this.bugmail) this.bugmail = {};
if (!this.bugmail.gmail) {

  /* Handles loading the message into gmail below. */
  function updateConversation(cv, callback) {
    var msgs = cv.getElementsByClassName("ii gt");
    try {
      for (var i in msgs) {
        if (msgs[i])
        {
          msg = msgs[i];
          if (!msg.bugmail_tweaked)
          {
            if (msg.innerHTML) {

              callback(msg);


            }
            msg.bugmail_tweaked = true;
          }
        }
      }
    } catch (e) {
      console.log("error tweaking");
      console.exception(e);
    }

    setTimeout(updateConversation, 3000, cv, callback);
  }


  function tweaker(gmail, callback) {
    try {
      if (gmail.getActiveViewType() == "cv") {
        console.log("got it");
        elem = gmail.getActiveViewElement();
        updateConversation(elem, callback);
     }
      else {
        console.log("loading", gmail);
        console.log(gmail.getActiveViewType());
        setTimeout(tweaker, 3000, gmail, callback);
      }
    } catch (e) {
      console.log("tweaker error");
      console.exception(e);
    }
  };

  function load (window, callback) {
    try {
      if ("gmonkey" in window) {
        window.gmonkey.load("2.0", function(gmail) { tweaker(gmail, callback); });
      } else {
        console.log("No gmonkey here");
      }
    } catch (e) {
      console.log("loading Error");
      console.exception(e);
    }
  }


  this.bugmail.gmail = {load: load};
}
