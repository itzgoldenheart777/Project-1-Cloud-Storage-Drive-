let user;
let currentFolder = null;
let selectedItems = new Set();
let currentView = "drive";
let contextTarget = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }

  user = data.session.user;

  document.getElementById("userEmail").innerText = user.email;
  document.getElementById("userId").innerText = user.id;

  await loadItems();
  setupDragDrop();
  setupSearch();
  setupRightClick();
}


async function loadItems() {

  let query = supabaseClient
    .from("drive_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_trashed", false);

  if (currentFolder === null) {
    query = query.is("parent_id", null);
  } else {
    query = query.eq("parent_id", currentFolder);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  renderItems(data || []);
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
  for (let file of files) {

    const path = `${user.id}/${Date.now()}_${file.name}`;

    await supabaseClient.storage
      .from("drive")
      .upload(path, file);

    await supabaseClient.from("drive_items").insert({
      user_id: user.id,
      name: file.name,
      type: "file",
      storage_path: path,
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

function openFolder(id) {
  currentFolder = id;
  loadItems();
}

async function deleteItem(id) {
  await supabaseClient
    .from("drive_items")
    .update({ is_trashed: true })
    .eq("id", id);

  loadItems();
}

async function moveItem(id, newParent) {
  await supabaseClient
    .from("drive_items")
    .update({ parent_id: newParent })
    .eq("id", id);

  loadItems();
}

function setupRightClick() {

  document.addEventListener("contextmenu", function(e) {

    const card = e.target.closest(".file-card");
    if (!card) return;

    e.preventDefault();
    contextTarget = card.dataset.id;

    showContextMenu(e.pageX, e.pageY);
  });
}
function setupSearch() {
  const search = document.getElementById("search");

  search.addEventListener("input", async function() {

    const { data } = await supabaseClient
      .from("drive_items")
      .select("*")
      .ilike("name", `%${this.value}%`)
      .eq("user_id", user.id);

    renderItems(data);
  });
}
async function changeAvatar() {

  document.getElementById("avatarUpload").click();

  document.getElementById("avatarUpload")
    .onchange = async function(e) {

    const file = e.target.files[0];
    const path = `avatars/${user.id}`;

    await supabaseClient.storage
      .from("drive")
      .upload(path, file, { upsert: true });

    const { data } =
      supabaseClient.storage.from("drive").getPublicUrl(path);

    document.getElementById("avatar").src =
      data.publicUrl;
  };
}

function toggleSelect(id) {

  if (selectedItems.has(id))
    selectedItems.delete(id);
  else
    selectedItems.add(id);

  renderSelection();
}
function renderItems(items) {

  const grid = document.getElementById("fileGrid");
  grid.innerHTML = "";

  items.forEach(item => {

    const div = document.createElement("div");
    div.className = "file-card";
    div.dataset.id = item.id;

    div.innerHTML = `
      <div>${item.type === "folder" ? "📁" : "📄"}</div>
      <p>${item.name}</p>
      <span class="menu">⋮</span>
    `;

    div.onclick = (e) => {

      if (e.ctrlKey) {
        toggleSelect(item.id);
        return;
      }

      if (item.type === "folder")
        openFolder(item.id);
      else
        preview(item.storage_path);
    };

    grid.appendChild(div);
  });
}
function preview(path) {

  const { data } =
    supabaseClient.storage
      .from("drive")
      .getPublicUrl(path);

  document.getElementById("previewContent")
    .innerHTML =
      `<iframe src="${data.publicUrl}" width="100%" height="500px"></iframe>`;

  document.getElementById("previewModal")
    .classList.remove("hidden");
}








