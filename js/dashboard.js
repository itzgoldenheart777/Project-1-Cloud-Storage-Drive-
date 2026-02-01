let currentFolder = null;
let renameTarget = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userEmail").innerText =
    data.session.user.email;

  loadItems();
  setupDragDrop();
}

async function loadItems() {
  const { data } = await supabaseClient
    .from("drive_items")
    .select("*")
    .eq("parent_id", currentFolder);

  renderItems(data);
  renderBreadcrumb();
}

function renderItems(items) {
  const grid = document.getElementById("fileGrid");
  grid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "file-card";
    card.innerHTML = `
      <div>${item.type === "folder" ? "📁" : "📄"}</div>
      <p>${item.name}</p>
      <span class="menu-btn" onclick="openMenu('${item.id}')">⋮</span>
    `;

    card.onclick = () => {
      if (item.type === "folder") {
        currentFolder = item.id;
        loadItems();
      } else {
        previewFile(item);
      }
    };

    grid.appendChild(card);
  });
}

/* Rename */

function openRename(id, name) {
  renameTarget = id;
  document.getElementById("renameInput").value = name;
  document.getElementById("renameModal").classList.remove("hidden");
}

async function confirmRename() {
  const newName = document.getElementById("renameInput").value;
  await supabaseClient
    .from("drive_items")
    .update({ name: newName })
    .eq("id", renameTarget);

  closeModal();
  loadItems();
}

/* Folder */

async function createFolder() {
  const name = prompt("Folder name:");
  if (!name) return;

  const { data: user } =
    await supabaseClient.auth.getUser();

  await supabaseClient.from("drive_items").insert({
    user_id: user.user.id,
    name,
    type: "folder",
    parent_id: currentFolder
  });

  loadItems();
}

/* Drag Drop */

function setupDragDrop() {
  const dropZone = document.getElementById("dropZone");
  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
  });

  dropZone.addEventListener("drop", async e => {
    e.preventDefault();
    const files = [...e.dataTransfer.files];
    uploadFiles(files);
  });
}

async function uploadFiles(files) {
  const { data: user } =
    await supabaseClient.auth.getUser();

  for (let file of files) {
    const path = `${user.user.id}/${Date.now()}_${file.name}`;

    await supabaseClient.storage
      .from("drive")
      .upload(path, file);

    await supabaseClient.from("drive_items").insert({
      user_id: user.user.id,
      name: file.name,
      type: "file",
      path,
      parent_id: currentFolder
    });
  }

  loadItems();
}

/* Preview */

function previewFile(item) {
  const { data } =
    supabaseClient.storage
      .from("drive")
      .getPublicUrl(item.path);

  document.getElementById("previewContent").innerHTML =
    `<iframe src="${data.publicUrl}" width="100%" height="400px"></iframe>`;

  document.getElementById("previewModal")
    .classList.remove("hidden");
}

function closeModal() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.add("hidden"));
}

/* Breadcrumb */

function renderBreadcrumb() {
  document.getElementById("breadcrumbs").innerText =
    currentFolder ? "My Drive > Folder" : "My Drive";
}

/* User */

function toggleUserMenu() {
  document.getElementById("userMenu")
    .classList.toggle("hidden");
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}



async function loadItems(view = "drive") {

  let query = supabaseClient
    .from("drive_items")
    .select("*")
    .eq("user_id", user.id);

  if (view === "drive") {
    query = query.eq("is_trashed", false)
                 .eq("parent_id", currentFolder);
  }

  if (view === "trash") {
    query = query.eq("is_trashed", true);
  }

  const { data } = await query;
  renderItems(data);
}
