import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";


/* 🔴 REPLACE WITH YOUR REAL FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const fileGrid = document.getElementById("fileGrid");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const fileRef = ref(storage, file.name);
  await uploadBytes(fileRef, file);

  alert("Upload successful!");
  loadFiles();
};

async function loadFiles() {
  fileGrid.innerHTML = "";

  const result = await listAll(ref(storage));

  result.items.forEach(async (item) => {
    const url = await getDownloadURL(item);

    const div = document.createElement("div");
    div.className = "file";
    div.innerText = item.name;
    div.onclick = () => window.open(url, "_blank");

    fileGrid.appendChild(div);
  });
}

loadFiles();
