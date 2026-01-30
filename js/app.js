import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  listAll,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* 🔴 REPLACE WITH YOUR FIREBASE CONFIG */
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
  loadFiles();
};

async function loadFiles() {
  fileGrid.innerHTML = "";
  const listRef = ref(storage);
  const result = await listAll(listRef);

  result.items.forEach(async (item) => {
    const url = await getDownloadURL(item);

    const div = document.createElement("div");
    div.className = "file";
    div.innerHTML = `
      <div class="file-icon">📄</div>
      <div class="file-name">${item.name}</div>
    `;

    div.onclick = () => window.open(url, "_blank");
    fileGrid.appendChild(div);
  });
}

loadFiles();
