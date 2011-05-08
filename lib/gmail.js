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
