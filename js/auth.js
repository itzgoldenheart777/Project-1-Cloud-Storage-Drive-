import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = async () => {
  await signInWithEmailAndPassword(
    auth,
    email.value,
    password.value
  );
  window.location.href = "dashboard.html";
};

window.register = async () => {
  await createUserWithEmailAndPassword(
    auth,
    email.value,
    password.value
  );
  window.location.href = "dashboard.html";
};
