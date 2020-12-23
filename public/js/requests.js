const ref = firebase.firestore().collection("requests");

ref.onSnapshot((snapshot) => {
  console.log(snapshot);
  let requests = [];
  snapshot.forEach((doc) => {
    requests.push({
      ...doc.data(),
      id: doc.id,
    });
  });

  let html = ``;
  requests.forEach((request) => {
    html += `<li>${request.text}</li>`;
  });
  document.querySelector("ul").innerHTML = html;
  console.log(requests);
});
