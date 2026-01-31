document.addEventListener("DOMContentLoaded", () => {
  init();
});

let user = null;
let currentPath = "";

async function init() {
  const res = await supabaseClient.auth.getUser();
  user = res.data.user;

  if (!user) {
    location.href = "login.html";
    return;
  }

  document.getElementById("userEmail").innerText = user.email;

  document.getElementById("uploadBtn").onclick = () =>
    document.getElementById("fileInput").click();

  document.getElementById("fileInput").onchange = uploadFile;

  loadMyDrive();
}

/* ---------- NAV FUNCTIONS ---------- */

function loadHome() {
  loadMyDrive();
}

function loadMyDrive() {
  currentPath = "";
  listFiles();
}

function loadRecent() {
  listFiles(true);
}

function loadTrash() {
  alert("Trash coming next step");
}

/* ---------- FILE OPS ---------- */

async function uploadFile() {
  const file = fileInput.files[0];
  if (!file) return;

  const path = `${user.id}/${currentPath}${file.name}`;

  const { error } = await supabaseClient.storage
    .from("files")
    .upload(path, file, { upsert: true });

  if (error) alert(error.message);
  listFiles();
}

async function listFiles(recent = false) {
  const { data, error } = await supabaseClient.storage
    .from("files")
    .list(`${user.id}/${currentPath}`, { limit: 100 });

  if (error) {
    alert(error.message);
    return;
  }

  const grid = document.getElementById("fileGrid");
  grid.innerHTML = "";

  data.forEach(file => {
    if (file.name === ".keep") return;

    const card = document.createElement("div");
    card.className = "file-card";

    card.innerHTML = `
      <div class="menu" onclick="toggleMenu(this)">⋮</div>
      <div class="dropdown">
        <button onclick="openFile('${file.name}')">Open</button>
        <button onclick="renameFile('${file.name}')">Rename</button>
        <button onclick="deleteFile('${file.name}')">Delete</button>
      </div>
      <p>${file.name}</p>
    `;

    grid.appendChild(card);
  });
}

async function openFile(name) {
  const { data } = supabaseClient.storage
    .from("files")
    .getPublicUrl(`${user.id}/${currentPath}${name}`);

  window.open(data.publicUrl, "_blank");
}

async function deleteFile(name) {
  if (!confirm("Delete this file?")) return;

  const { error } = await supabaseClient.storage
    .from("files")
    .remove([`${user.id}/${currentPath}${name}`]);

  if (error) alert(error.message);
  listFiles();
}

async function renameFile(oldName) {
  const newName = prompt("New name (without extension)");
  if (!newName) return;

  const ext = oldName.includes(".") ? "." + oldName.split(".").pop() : "";
  const newFull = newName + ext;

  await supabaseClient.storage
    .from("files")
    .move(
      `${user.id}/${currentPath}${oldName}`,
      `${user.id}/${currentPath}${newFull}`
    );

  listFiles();
}

/* ---------- UI ---------- */

function toggleMenu(el) {
  el.nextElementSibling.classList.toggle("show");
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.href = "login.html";
}
