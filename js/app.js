import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const grid = document.getElementById("fileGrid");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  const storageRef = ref(storage, file.name);
  await uploadBytes(storageRef, file);
  loadFiles();
};

async function loadFiles() {
  grid.innerHTML = "";
  const listRef = ref(storage);
  const files = await listAll(listRef);

  files.items.forEach(async fileRef => {
    const url = await getDownloadURL(fileRef);
    const div = document.createElement("div");
    div.className = "file";
    div.innerHTML = fileRef.name;
    div.onclick = () => window.open(url);
    grid.appendChild(div);
  });
}

loadFiles();
