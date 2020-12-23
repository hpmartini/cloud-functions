import * as functions from "firebase-functions";

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
