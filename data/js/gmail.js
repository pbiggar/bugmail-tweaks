/*
 * Tweaks to gmail to make bugmail more tolerable.
 */



function tweaker(gmail) {
  try {

    console.log("loaded", gmail);
    console.log(gmail.getActiveViewType());
    setTimeout(tweaker, 3000, gmail);

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
