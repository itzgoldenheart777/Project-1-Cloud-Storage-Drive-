 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/js/dashboard.js b/js/dashboard.js
index 6513b3508a215d8c9eceea33d13c633900189f67..1a07025a2d6e56502679813e51990997df631d38 100644
--- a/js/dashboard.js
+++ b/js/dashboard.js
@@ -1,472 +1,407 @@
- (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
-diff --git a/js/dashboard.js b/js/dashboard.js
-index ddd064eef51ad75401693b79188f823352bae240..5d392df60e079c69fac472860eebd101276510a3 100644
---- a/js/dashboard.js
-+++ b/js/dashboard.js
-@@ -1,169 +1,425 @@
- const supabaseClient = supabase.createClient(
-   "https://woysaoheokhipqpfphpr.supabase.co",
-   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXNhb2hlb2toaXBxcGZwaHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDg0NDcsImV4cCI6MjA4NTMyNDQ0N30.IuWML5hwlXmo6yONo5JaYfzsypkajyxZ29sfyjaRqcA"
--
- );
- 
--//const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXNhb2hlb2toaXBxcGZwaHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDg0NDcsImV4cCI6MjA4NTMyNDQ0N30.IuWML5hwlXmo6yONo5JaYfzsypkajyxZ29sfyjaRqcA";
--//"sb_publishable_WbweOMELckXb1bfnEA-g9A_YF3NwmSR"
--
- let currentUser = null;
-+let files = [];
-+let viewMode = "grid";
-+let sortMode = "name-asc";
-+let searchTerm = "";
- 
- document.addEventListener("DOMContentLoaded", init);
- 
- async function init() {
-   const { data: { user } } = await supabaseClient.auth.getUser();
- 
-   if (!user) {
-     window.location.href = "login.html";
-     return;
-   }
- 
-   currentUser = user;
-   loadUserInfo();
--  loadFiles();
-   setupAvatarMenu();
-+  setupToolbar();
-+  setupUploads();
-+  await loadFiles();
- }
- 
- /* ---------------- MENU ---------------- */
- 
- function setupAvatarMenu() {
-   const avatarBtn = document.getElementById("avatarBtn");
-   const menu = document.getElementById("userMenu");
- 
-   avatarBtn.addEventListener("click", () => {
-     menu.classList.toggle("hidden");
-+    avatarBtn.setAttribute("aria-expanded", menu.classList.contains("hidden") ? "false" : "true");
-   });
- 
-   document.addEventListener("click", (e) => {
-     if (!avatarBtn.contains(e.target) && !menu.contains(e.target)) {
-       menu.classList.add("hidden");
-+      avatarBtn.setAttribute("aria-expanded", "false");
-+    }
-+  });
-+}
-+
-+/* ---------------- TOOLBAR ---------------- */
-+
-+function setupToolbar() {
-+  const searchInput = document.getElementById("searchInput");
-+  const sortSelect = document.getElementById("sortSelect");
-+  const viewButtons = document.querySelectorAll(".view-toggle button");
-+  const refreshBtn = document.getElementById("refreshBtn");
-+
-+  searchInput.addEventListener("input", (event) => {
-+    searchTerm = event.target.value.trim().toLowerCase();
-+    renderFiles();
-+  });
-+
-+  sortSelect.addEventListener("change", (event) => {
-+    sortMode = event.target.value;
-+    renderFiles();
-+  });
-+
-+  viewButtons.forEach((btn) => {
-+    btn.addEventListener("click", () => {
-+      viewButtons.forEach((button) => button.classList.remove("active"));
-+      btn.classList.add("active");
-+      viewMode = btn.dataset.view;
-+      renderFiles();
-+    });
-+  });
-+
-+  refreshBtn.addEventListener("click", async () => {
-+    updateStatus("Refreshing...");
-+    await loadFiles();
-+    updateStatus("Ready");
-+  });
-+}
-+
-+function setupUploads() {
-+  const uploadBtn = document.getElementById("uploadBtn");
-+  const newUploadBtn = document.getElementById("newUploadBtn");
-+  const fileInput = document.getElementById("fileInput");
-+  const dropZone = document.getElementById("dropZone");
-+
-+  const openFilePicker = () => fileInput.click();
-+
-+  uploadBtn.addEventListener("click", openFilePicker);
-+  newUploadBtn.addEventListener("click", openFilePicker);
-+
-+  fileInput.addEventListener("change", async () => {
-+    if (fileInput.files.length) {
-+      await uploadFiles(Array.from(fileInput.files));
-+      fileInput.value = "";
-+    }
-+  });
-+
-+  ["dragenter", "dragover"].forEach((eventName) => {
-+    dropZone.addEventListener(eventName, (event) => {
-+      event.preventDefault();
-+      dropZone.classList.add("active");
-+    });
-+  });
-+
-+  ["dragleave", "drop"].forEach((eventName) => {
-+    dropZone.addEventListener(eventName, (event) => {
-+      event.preventDefault();
-+      dropZone.classList.remove("active");
-+    });
-+  });
-+
-+  dropZone.addEventListener("drop", async (event) => {
-+    const droppedFiles = Array.from(event.dataTransfer.files);
-+    if (droppedFiles.length) {
-+      await uploadFiles(droppedFiles);
-     }
-   });
- }
- 
- /* ---------------- USER INFO ---------------- */
- 
- function loadUserInfo() {
-+  const avatar = currentUser.user_metadata?.avatar_url;
-+  const fullName = currentUser.user_metadata?.full_name || "";
-+
-   document.getElementById("emailField").value = currentUser.email;
--  document.getElementById("displayName").value =
--    currentUser.user_metadata?.full_name || "";
-+  document.getElementById("displayName").value = fullName;
-+  document.getElementById("detailEmail").textContent = currentUser.email;
-+  document.getElementById("detailName").textContent = fullName || "Not set";
-+  document.getElementById("detailSignIn").textContent = new Date(
-+    currentUser.last_sign_in_at || Date.now()
-+  ).toLocaleString();
-+
-+  if (avatar) {
-+    document.getElementById("userAvatar").src = avatar;
-+    document.getElementById("avatarPreview").src = avatar;
-+  } else {
-+    const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}`;
-+    document.getElementById("userAvatar").src = initialsUrl;
-+    document.getElementById("avatarPreview").src = initialsUrl;
-+  }
-+
-+  document.getElementById("avatarInput").addEventListener("change", previewAvatar);
-+}
-+
-+function previewAvatar(event) {
-+  const file = event.target.files[0];
-+  if (!file) return;
-+
-+  const reader = new FileReader();
-+  reader.onload = () => {
-+    document.getElementById("avatarPreview").src = reader.result;
-+  };
-+  reader.readAsDataURL(file);
- }
- 
- /* ---------------- PROFILE ---------------- */
- 
- function openProfile() {
-   document.getElementById("profileModal").classList.remove("hidden");
- }
- 
- function closeProfile() {
-   document.getElementById("profileModal").classList.add("hidden");
- }
- 
- async function saveProfile() {
--  const full_name = document.getElementById("displayName").value;
-+  const full_name = document.getElementById("displayName").value.trim();
-+  const avatarUrl = document.getElementById("avatarPreview").src;
- 
-   const { error } = await supabaseClient.auth.updateUser({
--    data: { full_name }
-+    data: { full_name, avatar_url: avatarUrl }
-   });
- 
-   if (error) {
-     alert(error.message);
-     return;
-   }
- 
-+  document.getElementById("userAvatar").src = avatarUrl;
-+  document.getElementById("detailName").textContent = full_name || "Not set";
-   alert("Profile updated");
-   closeProfile();
- }
- 
-+/* ---------------- DETAILS ---------------- */
-+
-+function viewDetails() {
-+  document.getElementById("detailsModal").classList.remove("hidden");
-+}
-+
-+function closeDetails() {
-+  document.getElementById("detailsModal").classList.add("hidden");
-+}
-+
- /* ---------------- PASSWORD RESET ---------------- */
- 
- async function resetPassword() {
-   const { error } =
-     await supabaseClient.auth.resetPasswordForEmail(currentUser.email, {
-       redirectTo: window.location.origin + "/reset.html"
-     });
- 
-   if (error) alert(error.message);
-   else alert("Password reset email sent.");
- }
- 
- /* ---------------- FILE UPLOAD ---------------- */
- 
--async function uploadFile() {
--  const file = document.getElementById("fileInput").files[0];
--  if (!file) {
--    alert("Select a file");
--    return;
--  }
-+async function uploadFiles(uploadList) {
-+  updateStatus(`Uploading ${uploadList.length} file(s)...`);
- 
--  const filePath = `${currentUser.id}/${file.name}`;
-+  for (const file of uploadList) {
-+    const filePath = `${currentUser.id}/${file.name}`;
-+    const { error } = await supabaseClient.storage
-+      .from("user-files")
-+      .upload(filePath, file, { upsert: true });
- 
--  const { error } = await supabaseClient.storage
--    .from("user-files")
--    .upload(filePath, file);
-+    if (error) {
-+      alert(error.message);
-+      updateStatus("Upload failed");
-+      return;
-+    }
-+  }
- 
--  if (error) alert(error.message);
--  else loadFiles();
-+  await loadFiles();
-+  updateStatus("Upload complete");
- }
- 
- /* ---------------- FILE LIST ---------------- */
- 
- async function loadFiles() {
-   const { data, error } = await supabaseClient.storage
-     .from("user-files")
--    .list(currentUser.id);
--
--  const container = document.getElementById("fileList");
--  container.innerHTML = "";
-+    .list(currentUser.id, { limit: 100, sortBy: { column: "name", order: "asc" } });
- 
-   if (error) {
-     console.error(error);
-+    updateStatus("Failed to load files");
-     return;
-   }
- 
--  if (!data.length) {
--    container.innerHTML = "<p>No files uploaded</p>";
-+  files = data.map((file) => ({
-+    ...file,
-+    size: file.metadata?.size || 0
-+  }));
-+
-+  updateStorageUsage();
-+  renderFiles();
-+}
-+
-+function renderFiles() {
-+  const container = document.getElementById("fileList");
-+  container.className = viewMode === "list" ? "file-grid list" : "file-grid";
-+  container.innerHTML = "";
-+
-+  const filtered = files.filter((file) => file.name.toLowerCase().includes(searchTerm));
-+  const sorted = sortFiles(filtered);
-+
-+  if (!sorted.length) {
-+    container.innerHTML = "<p>No files found</p>";
-     return;
-   }
- 
--  data.forEach(file => {
--    const div = document.createElement("div");
--    div.className = "file-card";
-+  sorted.forEach((file) => {
-+    const card = document.createElement("div");
-+    card.className = viewMode === "list" ? "file-card list" : "file-card";
- 
--    div.innerHTML = `
--      <p>${file.name}</p>
--      <button onclick="downloadFile('${file.name}')">Download</button>
--      <button onclick="deleteFile('${file.name}')">Delete</button>
-+    const meta = document.createElement("div");
-+    meta.className = "file-meta";
-+    meta.innerHTML = `
-+      <span class="file-name">${file.name}</span>
-+      <span class="file-details">${formatSize(file.size)} • ${formatDate(file.updated_at)}</span>
-     `;
- 
--    container.appendChild(div);
-+    const actions = document.createElement("div");
-+    actions.className = "file-actions";
-+
-+    actions.appendChild(createActionButton("Download", () => downloadFile(file.name)));
-+    actions.appendChild(createActionButton("Rename", () => renameFile(file.name)));
-+    actions.appendChild(createActionButton("Copy link", () => copyFileLink(file.name)));
-+    actions.appendChild(createActionButton("Delete", () => deleteFile(file.name)));
-+
-+    if (viewMode === "list") {
-+      card.appendChild(meta);
-+      card.appendChild(actions);
-+    } else {
-+      card.appendChild(meta);
-+      card.appendChild(actions);
-+    }
-+
-+    container.appendChild(card);
-+  });
-+}
-+
-+function sortFiles(list) {
-+  const sorted = [...list];
-+  sorted.sort((a, b) => {
-+    switch (sortMode) {
-+      case "name-desc":
-+        return b.name.localeCompare(a.name);
-+      case "time-asc":
-+        return new Date(a.updated_at) - new Date(b.updated_at);
-+      case "time-desc":
-+        return new Date(b.updated_at) - new Date(a.updated_at);
-+      default:
-+        return a.name.localeCompare(b.name);
-+    }
-   });
-+  return sorted;
-+}
-+
-+function createActionButton(label, handler) {
-+  const button = document.createElement("button");
-+  button.textContent = label;
-+  button.addEventListener("click", handler);
-+  return button;
-+}
-+
-+function formatSize(bytes) {
-+  if (!bytes) return "0 B";
-+  const units = ["B", "KB", "MB", "GB"];
-+  let size = bytes;
-+  let unitIndex = 0;
-+  while (size >= 1024 && unitIndex < units.length - 1) {
-+    size /= 1024;
-+    unitIndex += 1;
-+  }
-+  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
-+}
-+
-+function formatDate(dateString) {
-+  if (!dateString) return "Unknown";
-+  return new Date(dateString).toLocaleDateString();
-+}
-+
-+function updateStorageUsage() {
-+  const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
-+  const maxBytes = 2 * 1024 * 1024 * 1024;
-+  const percent = Math.min((totalBytes / maxBytes) * 100, 100);
-+  document.getElementById("storageFill").style.width = `${percent}%`;
-+  document.getElementById("storageText").textContent =
-+    `${formatSize(totalBytes)} of 2 GB used`;
-+}
-+
-+function updateStatus(message) {
-+  document.getElementById("statusText").textContent = message;
- }
- 
- /* ---------------- DOWNLOAD ---------------- */
- 
- async function downloadFile(name) {
--  const { data } = await supabaseClient.storage
-+  const { data, error } = await supabaseClient.storage
-     .from("user-files")
-     .createSignedUrl(`${currentUser.id}/${name}`, 60);
- 
-+  if (error) {
-+    alert(error.message);
-+    return;
-+  }
-+
-   window.open(data.signedUrl, "_blank");
- }
- 
-+async function copyFileLink(name) {
-+  const { data, error } = await supabaseClient.storage
-+    .from("user-files")
-+    .createSignedUrl(`${currentUser.id}/${name}`, 60 * 60);
-+
-+  if (error) {
-+    alert(error.message);
-+    return;
-+  }
-+
-+  await navigator.clipboard.writeText(data.signedUrl);
-+  updateStatus("Link copied to clipboard");
-+}
-+
-+/* ---------------- RENAME ---------------- */
-+
-+async function renameFile(name) {
-+  const newName = prompt("Enter a new filename", name);
-+  if (!newName || newName === name) return;
-+
-+  const { error } = await supabaseClient.storage
-+    .from("user-files")
-+    .move(`${currentUser.id}/${name}`, `${currentUser.id}/${newName}`);
-+
-+  if (error) {
-+    alert(error.message);
-+    return;
-+  }
-+
-+  await loadFiles();
-+  updateStatus("File renamed");
-+}
-+
- /* ---------------- DELETE ---------------- */
- 
- async function deleteFile(name) {
--  await supabaseClient.storage
-+  const confirmed = confirm(`Delete ${name}?`);
-+  if (!confirmed) return;
-+
-+  const { error } = await supabaseClient.storage
-     .from("user-files")
-     .remove([`${currentUser.id}/${name}`]);
- 
--  loadFiles();
-+  if (error) {
-+    alert(error.message);
-+    return;
-+  }
-+
-+  await loadFiles();
-+  updateStatus("File deleted");
- }
- 
- /* ---------------- LOGOUT ---------------- */
- 
- async function logout() {
-   await supabaseClient.auth.signOut();
-   window.location.href = "login.html";
- }
- 
-EOF
-)
+const supabaseClient = window.supabaseClient;
+
+let currentUser = null;
+let files = [];
+let viewMode = "grid";
+let sortMode = "name-asc";
+let searchTerm = "";
+
+document.addEventListener("DOMContentLoaded", init);
+
+async function init() {
+  const { data: { user } } = await supabaseClient.auth.getUser();
+
+  if (!user) {
+    window.location.href = "login.html";
+    return;
+  }
+
+  currentUser = user;
+  loadUserInfo();
+  setupAvatarMenu();
+  setupToolbar();
+  setupUploads();
+  await loadFiles();
+}
+
+function setupAvatarMenu() {
+  const avatarBtn = document.getElementById("avatarBtn");
+  const menu = document.getElementById("userMenu");
+
+  avatarBtn.addEventListener("click", () => {
+    menu.classList.toggle("hidden");
+    avatarBtn.setAttribute(
+      "aria-expanded",
+      menu.classList.contains("hidden") ? "false" : "true"
+    );
+  });
+
+  document.addEventListener("click", (event) => {
+    if (!avatarBtn.contains(event.target) && !menu.contains(event.target)) {
+      menu.classList.add("hidden");
+      avatarBtn.setAttribute("aria-expanded", "false");
+    }
+  });
+}
+
+function setupToolbar() {
+  const searchInput = document.getElementById("searchInput");
+  const sortSelect = document.getElementById("sortSelect");
+  const viewButtons = document.querySelectorAll(".view-toggle button");
+  const refreshBtn = document.getElementById("refreshBtn");
+
+  searchInput.addEventListener("input", (event) => {
+    searchTerm = event.target.value.trim().toLowerCase();
+    renderFiles();
+  });
+
+  sortSelect.addEventListener("change", (event) => {
+    sortMode = event.target.value;
+    renderFiles();
+  });
+
+  viewButtons.forEach((btn) => {
+    btn.addEventListener("click", () => {
+      viewButtons.forEach((button) => button.classList.remove("active"));
+      btn.classList.add("active");
+      viewMode = btn.dataset.view;
+      renderFiles();
+    });
+  });
+
+  refreshBtn.addEventListener("click", async () => {
+    updateStatus("Refreshing...");
+    await loadFiles();
+    updateStatus("Ready");
+  });
+}
+
+function setupUploads() {
+  const uploadBtn = document.getElementById("uploadBtn");
+  const newUploadBtn = document.getElementById("newUploadBtn");
+  const fileInput = document.getElementById("fileInput");
+  const dropZone = document.getElementById("dropZone");
+
+  const openFilePicker = () => fileInput.click();
+
+  uploadBtn.addEventListener("click", openFilePicker);
+  newUploadBtn.addEventListener("click", openFilePicker);
+
+  fileInput.addEventListener("change", async () => {
+    if (fileInput.files.length) {
+      await uploadFiles(Array.from(fileInput.files));
+      fileInput.value = "";
+    }
+  });
+
+  ["dragenter", "dragover"].forEach((eventName) => {
+    dropZone.addEventListener(eventName, (event) => {
+      event.preventDefault();
+      dropZone.classList.add("active");
+    });
+  });
+
+  ["dragleave", "drop"].forEach((eventName) => {
+    dropZone.addEventListener(eventName, (event) => {
+      event.preventDefault();
+      dropZone.classList.remove("active");
+    });
+  });
+
+  dropZone.addEventListener("drop", async (event) => {
+    const droppedFiles = Array.from(event.dataTransfer.files);
+    if (droppedFiles.length) {
+      await uploadFiles(droppedFiles);
+    }
+  });
+}
+
+function loadUserInfo() {
+  const avatar = currentUser.user_metadata?.avatar_url;
+  const fullName = currentUser.user_metadata?.full_name || "";
+
+  document.getElementById("emailField").value = currentUser.email;
+  document.getElementById("displayName").value = fullName;
+  document.getElementById("detailEmail").textContent = currentUser.email;
+  document.getElementById("detailName").textContent = fullName || "Not set";
+  document.getElementById("detailSignIn").textContent = new Date(
+    currentUser.last_sign_in_at || Date.now()
+  ).toLocaleString();
+
+  const avatarUrl = avatar
+    ? avatar
+    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}`;
+
+  document.getElementById("userAvatar").src = avatarUrl;
+  document.getElementById("avatarPreview").src = avatarUrl;
+  document.getElementById("avatarInput").addEventListener("change", previewAvatar);
+}
+
+function previewAvatar(event) {
+  const file = event.target.files[0];
+  if (!file) return;
+
+  const reader = new FileReader();
+  reader.onload = () => {
+    document.getElementById("avatarPreview").src = reader.result;
+  };
+  reader.readAsDataURL(file);
+}
+
+function openProfile() {
+  document.getElementById("profileModal").classList.remove("hidden");
+}
+
+function closeProfile() {
+  document.getElementById("profileModal").classList.add("hidden");
+}
+
+async function saveProfile() {
+  const fullName = document.getElementById("displayName").value.trim();
+  const avatarUrl = document.getElementById("avatarPreview").src;
+
+  const { error } = await supabaseClient.auth.updateUser({
+    data: { full_name: fullName, avatar_url: avatarUrl }
+  });
+
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  document.getElementById("userAvatar").src = avatarUrl;
+  document.getElementById("detailName").textContent = fullName || "Not set";
+  alert("Profile updated");
+  closeProfile();
+}
+
+function viewDetails() {
+  document.getElementById("detailsModal").classList.remove("hidden");
+}
+
+function closeDetails() {
+  document.getElementById("detailsModal").classList.add("hidden");
+}
+
+async function resetPassword() {
+  const { error } = await supabaseClient.auth.resetPasswordForEmail(currentUser.email, {
+    redirectTo: window.location.origin + "/reset.html"
+  });
+
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  alert("Password reset email sent.");
+}
+
+async function loadFiles() {
+  updateStatus("Loading files...");
+  const { data, error } = await supabaseClient
+    .from("files")
+    .select("*")
+    .eq("user_id", currentUser.id)
+    .order("created_at", { ascending: false });
+
+  if (error) {
+    alert(error.message);
+    updateStatus("Failed to load files");
+    return;
+  }
+
+  files = data || [];
+  updateStorageUsage();
+  renderFiles();
+  updateStatus("Ready");
+}
+
+function renderFiles() {
+  const container = document.getElementById("fileList");
+  container.className = viewMode === "list" ? "file-grid list" : "file-grid";
+  container.innerHTML = "";
+
+  const filtered = files.filter((file) =>
+    (file.name || "").toLowerCase().includes(searchTerm)
+  );
+  const sorted = sortFiles(filtered);
+
+  if (!sorted.length) {
+    container.innerHTML = "<p>No files found</p>";
+    return;
+  }
+
+  sorted.forEach((file) => {
+    const card = document.createElement("div");
+    card.className = viewMode === "list" ? "file-card list" : "file-card";
+
+    const meta = document.createElement("div");
+    meta.className = "file-meta";
+    meta.innerHTML = `
+      <span class="file-name">${file.name}</span>
+      <span class="file-details">${formatSize(file.size)} • ${formatDate(file.created_at)}</span>
+    `;
+
+    const actions = document.createElement("div");
+    actions.className = "file-actions";
+    actions.appendChild(createActionButton("Download", () => downloadFile(file)));
+    actions.appendChild(createActionButton("Share", () => copyFileLink(file)));
+    actions.appendChild(createActionButton("Rename", () => renameFile(file)));
+    actions.appendChild(createActionButton("Delete", () => deleteFile(file)));
+
+    card.appendChild(meta);
+    card.appendChild(actions);
+    container.appendChild(card);
+  });
+}
+
+function sortFiles(list) {
+  const sorted = [...list];
+  sorted.sort((a, b) => {
+    switch (sortMode) {
+      case "name-desc":
+        return (b.name || "").localeCompare(a.name || "");
+      case "time-asc":
+        return new Date(a.created_at) - new Date(b.created_at);
+      case "time-desc":
+        return new Date(b.created_at) - new Date(a.created_at);
+      default:
+        return (a.name || "").localeCompare(b.name || "");
+    }
+  });
+  return sorted;
+}
+
+function createActionButton(label, handler) {
+  const button = document.createElement("button");
+  button.textContent = label;
+  button.addEventListener("click", handler);
+  return button;
+}
+
+async function uploadFiles(fileList) {
+  updateStatus("Uploading files...");
+  for (const file of fileList) {
+    const path = `${currentUser.id}/${Date.now()}_${file.name}`;
+    const { error } = await supabaseClient.storage.from("drive").upload(path, file);
+
+    if (error) {
+      alert(error.message);
+      continue;
+    }
+
+    await supabaseClient.from("files").insert({
+      user_id: currentUser.id,
+      name: file.name,
+      path,
+      type: file.type,
+      size: file.size
+    });
+  }
+
+  await loadFiles();
+  updateStatus("Upload complete");
+}
+
+async function downloadFile(file) {
+  const { data, error } = await supabaseClient.storage
+    .from("drive")
+    .createSignedUrl(file.path, 60);
+
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  window.open(data.signedUrl, "_blank");
+}
+
+async function copyFileLink(file) {
+  const { data, error } = await supabaseClient.storage
+    .from("drive")
+    .createSignedUrl(file.path, 60 * 60);
+
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  await navigator.clipboard.writeText(data.signedUrl);
+  updateStatus("Link copied to clipboard");
+}
+
+async function renameFile(file) {
+  const newName = prompt("Enter a new filename", file.name);
+  if (!newName || newName === file.name) return;
+
+  const newPath = `${currentUser.id}/${Date.now()}_${newName}`;
+  const { error } = await supabaseClient.storage
+    .from("drive")
+    .move(file.path, newPath);
+
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  await supabaseClient
+    .from("files")
+    .update({ name: newName, path: newPath })
+    .eq("id", file.id);
+
+  await loadFiles();
+  updateStatus("File renamed");
+}
+
+async function deleteFile(file) {
+  const confirmed = confirm(`Delete ${file.name}?`);
+  if (!confirmed) return;
+
+  const { error } = await supabaseClient.storage
+    .from("drive")
+    .remove([file.path]);
+
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  await supabaseClient.from("files").delete().eq("id", file.id);
+  await loadFiles();
+  updateStatus("File deleted");
+}
+
+function formatSize(bytes) {
+  if (!bytes) return "0 B";
+  const units = ["B", "KB", "MB", "GB"];
+  let size = bytes;
+  let unitIndex = 0;
+  while (size >= 1024 && unitIndex < units.length - 1) {
+    size /= 1024;
+    unitIndex += 1;
+  }
+  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
+}
+
+function formatDate(dateString) {
+  if (!dateString) return "Unknown";
+  return new Date(dateString).toLocaleDateString();
+}
+
+function updateStorageUsage() {
+  const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
+  const maxBytes = 2 * 1024 * 1024 * 1024;
+  const percent = Math.min((totalBytes / maxBytes) * 100, 100);
+  document.getElementById("storageFill").style.width = `${percent}%`;
+  document.getElementById("storageText").textContent =
+    `${formatSize(totalBytes)} of 2 GB used`;
+}
+
+function updateStatus(message) {
+  document.getElementById("statusText").textContent = message;
+}
+
+async function logout() {
+  await supabaseClient.auth.signOut();
+  window.location.href = "login.html";
+}
 
EOF
)
