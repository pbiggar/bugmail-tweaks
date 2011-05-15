try {
  var gmail = this.bugmail.gmail;
  var bzmail = this.bugmail.bzmail;
  gmail.load(this, bzmail.translate);
} catch (e) {
  console.log("error loading");
  console.trace(e);
}

