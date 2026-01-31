const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const fileGrid = document.getElementById("fileGrid");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const { data: { user } } = await window.supabaseClient.auth.getUser();
  const filePath = `${user.id}/${file.name}`;

  const { error } = await window.supabaseClient
    .storage
    .from("files")
    .upload(filePath, file);

  if (error) alert(error.message);
  else loadFiles();
};

async function loadFiles() {
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userEmail").innerText = user.email;

  const { data } = await window.supabaseClient
    .storage
    .from("files")
    .list(user.id);

  fileGrid.innerHTML = "";

  data.forEach(file => {
    const card = document.createElement("div");
    card.className = "file-card";

    card.innerHTML = `
      <div class="file-menu" onclick="toggleDropdown(this)">⋮</div>
      <div class="dropdown">
        <button onclick="openFile('${file.name}')">Open</button>
        <button onclick="deleteFile('${file.name}')">Delete</button>
      </div>
      <h4>${file.name}</h4>
    `;

    fileGrid.appendChild(card);
  });
}

function toggleDropdown(el) {
  const dropdown = el.nextElementSibling;
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

async function openFile(name) {
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  const { data } = window.supabaseClient
    .storage
    .from("files")
    .getPublicUrl(`${user.id}/${name}`);

  window.open(data.publicUrl, "_blank");
}

async function deleteFile(name) {
    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (!user) {
        alert("User not authenticated");
        return;
    }

    const filePath = `${user.id}/${name}`;

    const { error } = await window.supabaseClient
        .storage
        .from("files")
        .remove([filePath]);

    if (error) {
        console.error(error);
        alert("Delete failed: " + error.message);
        return;
    }

    loadFiles();
}



function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
}

loadFiles();
