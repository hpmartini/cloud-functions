import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

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

// upvote callable function
exports.upvote = functions.https.onCall(async (data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can vote up requests"
    );
  }
  // get refs for user doc & request doc
  const user = admin.firestore().collection("users").doc(context.auth.uid);
  const request = admin.firestore().collection("requests").doc(data.id);

  const doc = await user.get();

  const userData = doc.data();
  if (!userData) {
    throw new functions.https.HttpsError("invalid-argument", "user not found");
  }

  // check thew user hasn't already upvoted
  if (userData.upvotedOn.includes(data.id)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You can only vote something up once"
    );
  }

  // update the array in user document
  await user.update({
    upvotedOn: [...userData.upvotedOn, data.id],
  });

  // update the votes on the request
  return request.update({
    upvotes: admin.firestore.FieldValue.increment(1),
  });
});

// firestore trigger for tracking activity
exports.logActivities = functions.firestore
  .document("/{collection}/{id}")
  .onCreate((snapshot, context) => {
    console.log(snapshot);
    const collection = context.params.collection;
    const activities = admin.firestore().collection("activities");

    if (collection === "requests") {
      return activities.add({ text: "a new tutorial request was added" });
    }
    if (collection === "users") {
      return activities.add({ text: "a new user signed up" });
    }
    return null;
  });
