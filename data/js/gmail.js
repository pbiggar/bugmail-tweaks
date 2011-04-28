/*
 * Tweaks to gmail to make bugmail more tolerable.
 */



function tweaker(document, gmonkey) {
    console.log("loaded");
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
