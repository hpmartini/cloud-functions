import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// http request 1
exports.randomNumber = functions.https.onRequest((req, resp) => {
  const number = Math.round(Math.random() * 100);
  console.log(number);
  resp.send(number.toString());
});

// http request
exports.toTheDojo = functions.https.onRequest((req, resp) => {
  resp.redirect("https://hpm.dev");
});

// http callable functions
exports.sayHello = functions.https.onCall((data, context) => {
  const name = data.name;
  return `hello, ${name}`;
});

// auth trigger (new user signed up)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  console.log("user created", user.email, user.uid);
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
  });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  console.log("user deleted", user.email, user.uid);
  return admin.firestore().collection("users").doc(user.uid).delete();
});

// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  if (data.text.length > 30) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "request must be no more then 30 characters long"
    );
  }
  return admin.firestore().collection("requests").add({
    text: data.text,
    upvotes: 0,
  });
});
