 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/js/dashboard.js b/js/dashboard.js
index 6513b3508a215d8c9eceea33d13c633900189f67..75c2456b6d68cdafd13fc9359064134a5b83b65e 100644
--- a/js/dashboard.js
+++ b/js/dashboard.js
@@ -1,472 +1,513 @@
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
+let previewUrls = new Map();
+let viewMode = "grid";
+let sortMode = "name-asc";
+let searchTerm = "";
+let demoMode = false;
+
+const DEMO_FILES = [
+  { id: "d1", name: "Project plan.pdf", size: 249000, created_at: new Date().toISOString(), type: "application/pdf", path: "demo/path1" },
+  { id: "d2", name: "Vacation.jpg", size: 1802000, created_at: new Date(Date.now() - 86400000).toISOString(), type: "image/jpeg", path: "demo/path2" },
+  { id: "d3", name: "Budget.xlsx", size: 122000, created_at: new Date(Date.now() - 6 * 86400000).toISOString(), type: "application/vnd.ms-excel", path: "demo/path3" }
+];
+
+document.addEventListener("DOMContentLoaded", init);
+
+async function init() {
+  setupAvatarMenu();
+  setupToolbar();
+  setupUploads();
+  setupMobileSidebar();
+
+  const { data: { user } } = await supabaseClient.auth.getUser();
+
+  if (!user) {
+    demoMode = true;
+    currentUser = { email: "demo@drive.local", user_metadata: { full_name: "Demo User" } };
+    files = [...DEMO_FILES];
+    loadUserInfo();
+    updateStorageUsage();
+    renderFiles();
+    updateStatus("Demo mode: sign in to sync cloud files");
+    return;
+  }
+
+  currentUser = user;
+  loadUserInfo();
+  await loadFiles();
+}
+
+function setupMobileSidebar() {
+  const menuToggle = document.getElementById("menuToggle");
+  const sidebar = document.getElementById("sidebar");
+  menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
+}
+
+function setupAvatarMenu() {
+  const avatarBtn = document.getElementById("avatarBtn");
+  const menu = document.getElementById("userMenu");
+
+  avatarBtn.addEventListener("click", () => {
+    menu.classList.toggle("hidden");
+    avatarBtn.setAttribute("aria-expanded", menu.classList.contains("hidden") ? "false" : "true");
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
+  document.getElementById("searchInput").addEventListener("input", (event) => {
+    searchTerm = event.target.value.trim().toLowerCase();
+    renderFiles();
+  });
+
+  document.getElementById("sortSelect").addEventListener("change", (event) => {
+    sortMode = event.target.value;
+    renderFiles();
+  });
+
+  document.querySelectorAll(".view-toggle button").forEach((btn) => {
+    btn.addEventListener("click", () => {
+      document.querySelectorAll(".view-toggle button").forEach((item) => item.classList.remove("active"));
+      btn.classList.add("active");
+      viewMode = btn.dataset.view;
+      renderFiles();
+    });
+  });
+
+  document.getElementById("refreshBtn").addEventListener("click", async () => {
+    updateStatus("Refreshing...");
+    if (demoMode) {
+      files = [...DEMO_FILES];
+      renderFiles();
+      updateStatus("Demo mode refreshed");
+      return;
+    }
+
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
+  const pickFile = () => fileInput.click();
+
+  uploadBtn.addEventListener("click", pickFile);
+  newUploadBtn.addEventListener("click", pickFile);
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
+  ["drop", "dragleave"].forEach((eventName) => {
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
+  const fullName = currentUser.user_metadata?.full_name || "User";
+  const avatarUrl = currentUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`;
+
+  document.getElementById("emailField").value = currentUser.email || "-";
+  document.getElementById("displayName").value = fullName;
+  document.getElementById("detailEmail").textContent = currentUser.email || "-";
+  document.getElementById("detailName").textContent = fullName;
+  document.getElementById("detailSignIn").textContent = new Date(currentUser.last_sign_in_at || Date.now()).toLocaleString();
+  document.getElementById("userAvatar").src = avatarUrl;
+  document.getElementById("avatarPreview").src = avatarUrl;
+
+  document.getElementById("avatarInput").addEventListener("change", (event) => {
+    const file = event.target.files[0];
+    if (!file) return;
+    const reader = new FileReader();
+    reader.onload = () => { document.getElementById("avatarPreview").src = reader.result; };
+    reader.readAsDataURL(file);
+  });
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
+  if (demoMode) {
+    document.getElementById("userAvatar").src = avatarUrl;
+    document.getElementById("detailName").textContent = fullName || "User";
+    alert("Profile updated in demo mode.");
+    closeProfile();
+    return;
+  }
+
+  const { error } = await supabaseClient.auth.updateUser({ data: { full_name: fullName, avatar_url: avatarUrl } });
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  document.getElementById("userAvatar").src = avatarUrl;
+  document.getElementById("detailName").textContent = fullName || "User";
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
+  if (demoMode) {
+    alert("Demo mode: sign in first to reset password.");
+    return;
+  }
+
+  const { error } = await supabaseClient.auth.resetPasswordForEmail(currentUser.email, {
+    redirectTo: `${window.location.origin}/reset.html`
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
+
+  const { data, error } = await supabaseClient
+    .from("files")
+    .select("id, name, path, type, size, created_at")
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
+  previewUrls = new Map();
+  await hydratePreviewUrls(files);
+  updateStorageUsage();
+  renderFiles();
+  updateStatus("Ready");
+}
+
+async function hydratePreviewUrls(list) {
+  const imageFiles = list.filter((file) => (file.type || "").startsWith("image/"));
+
+  await Promise.all(
+    imageFiles.map(async (file) => {
+      const { data, error } = await supabaseClient.storage.from("drive").createSignedUrl(file.path, 60 * 20);
+      if (!error && data?.signedUrl) {
+        previewUrls.set(file.id, data.signedUrl);
+      }
+    })
+  );
+}
+
+function renderFiles() {
+  const container = document.getElementById("fileList");
+  container.className = viewMode === "list" ? "file-grid list" : "file-grid";
+  container.innerHTML = "";
+
+  const visible = sortFiles(files.filter((file) => (file.name || "").toLowerCase().includes(searchTerm)));
+
+  if (!visible.length) {
+    container.innerHTML = "<p>No files found.</p>";
+    return;
+  }
+
+  visible.forEach((file) => {
+    const card = document.createElement("article");
+    card.className = "file-card";
+
+    const thumb = document.createElement("div");
+    thumb.className = "file-thumb";
+    const previewUrl = previewUrls.get(file.id);
+    if (previewUrl) {
+      thumb.innerHTML = `<img src="${previewUrl}" alt="${file.name}">`;
+    } else {
+      thumb.innerHTML = `<span class="ext">${getExtension(file.name)}</span>`;
+    }
+
+    const body = document.createElement("div");
+    body.className = "file-body";
+    body.innerHTML = `
+      <div class="file-name">${file.name}</div>
+      <div class="file-details">${formatSize(file.size)} • ${formatDate(file.created_at)}</div>
+    `;
+
+    const actions = document.createElement("div");
+    actions.className = "file-actions";
+    actions.appendChild(actionButton("Download", () => downloadFile(file)));
+    actions.appendChild(actionButton("Share", () => copyFileLink(file)));
+    actions.appendChild(actionButton("Rename", () => renameFile(file)));
+    actions.appendChild(actionButton("Delete", () => deleteFile(file), "danger"));
+    body.appendChild(actions);
+
+    card.appendChild(thumb);
+    card.appendChild(body);
+    container.appendChild(card);
+  });
+}
+
+function actionButton(label, onClick, className = "") {
+  const button = document.createElement("button");
+  button.textContent = label;
+  if (className) button.classList.add(className);
+  button.addEventListener("click", onClick);
+  return button;
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
+      case "size-desc":
+        return (b.size || 0) - (a.size || 0);
+      case "size-asc":
+        return (a.size || 0) - (b.size || 0);
+      default:
+        return (a.name || "").localeCompare(b.name || "");
+    }
+  });
+  return sorted;
+}
+
+async function uploadFiles(fileList) {
+  if (demoMode) {
+    const demoUploaded = fileList.map((file, index) => ({
+      id: `demo-${Date.now()}-${index}`,
+      name: file.name,
+      size: file.size,
+      type: file.type,
+      path: `demo/${file.name}`,
+      created_at: new Date().toISOString()
+    }));
+    files = [...demoUploaded, ...files];
+    renderFiles();
+    updateStorageUsage();
+    updateStatus("Uploaded in demo mode");
+    return;
+  }
+
+  updateStatus("Uploading...");
+
+  for (const file of fileList) {
+    const path = `${currentUser.id}/${Date.now()}_${file.name}`;
+    const { error: uploadError } = await supabaseClient.storage.from("drive").upload(path, file);
+
+    if (uploadError) {
+      alert(uploadError.message);
+      continue;
+    }
+
+    const { error: insertError } = await supabaseClient.from("files").insert({
+      user_id: currentUser.id,
+      name: file.name,
+      path,
+      type: file.type,
+      size: file.size
+    });
+
+    if (insertError) {
+      alert(insertError.message);
+    }
+  }
+
+  await loadFiles();
+  updateStatus("Upload complete");
+}
+
+async function downloadFile(file) {
+  if (demoMode) {
+    alert("Demo mode: cloud download is disabled.");
+    return;
+  }
+
+  const { data, error } = await supabaseClient.storage.from("drive").createSignedUrl(file.path, 60);
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  window.open(data.signedUrl, "_blank");
+}
+
+async function copyFileLink(file) {
+  if (demoMode) {
+    await navigator.clipboard.writeText(`demo://file/${encodeURIComponent(file.name)}`);
+    updateStatus("Demo link copied");
+    return;
+  }
+
+  const { data, error } = await supabaseClient.storage.from("drive").createSignedUrl(file.path, 60 * 60);
+  if (error) {
+    alert(error.message);
+    return;
+  }
+
+  await navigator.clipboard.writeText(data.signedUrl);
+  updateStatus("Share link copied");
+}
+
+async function renameFile(file) {
+  const newName = prompt("Enter new file name", file.name);
+  if (!newName || newName === file.name) return;
+
+  if (demoMode) {
+    files = files.map((item) => (item.id === file.id ? { ...item, name: newName } : item));
+    renderFiles();
+    updateStatus("Renamed in demo mode");
+    return;
+  }
+
+  const extension = getExtension(file.path || file.name).toLowerCase();
+  const keepExtension = newName.toLowerCase().endsWith(`.${extension.toLowerCase()}`) || !extension;
+  const finalName = keepExtension ? newName : `${newName}.${extension}`;
+  const newPath = `${currentUser.id}/${Date.now()}_${finalName}`;
+
+  const { error: moveError } = await supabaseClient.storage.from("drive").move(file.path, newPath);
+  if (moveError) {
+    alert(moveError.message);
+    return;
+  }
+
+  const { error: updateError } = await supabaseClient
+    .from("files")
+    .update({ name: finalName, path: newPath })
+    .eq("id", file.id);
+
+  if (updateError) {
+    alert(updateError.message);
+    return;
+  }
+
+  await loadFiles();
+  updateStatus("Renamed");
+}
+
+async function deleteFile(file) {
+  if (!confirm(`Delete "${file.name}"?`)) return;
+
+  if (demoMode) {
+    files = files.filter((item) => item.id !== file.id);
+    renderFiles();
+    updateStorageUsage();
+    updateStatus("Deleted in demo mode");
+    return;
+  }
+
+  const { error: removeError } = await supabaseClient.storage.from("drive").remove([file.path]);
+  if (removeError) {
+    alert(removeError.message);
+    return;
+  }
+
+  const { error: deleteError } = await supabaseClient.from("files").delete().eq("id", file.id);
+  if (deleteError) {
+    alert(deleteError.message);
+    return;
+  }
+
+  await loadFiles();
+  updateStatus("Deleted");
+}
+
+function updateStorageUsage() {
+  const total = files.reduce((sum, file) => sum + (file.size || 0), 0);
+  const max = 2 * 1024 * 1024 * 1024;
+  const percent = Math.min((total / max) * 100, 100);
+  document.getElementById("storageFill").style.width = `${percent}%`;
+  document.getElementById("storageText").textContent = `${formatSize(total)} of 2 GB used`;
+}
+
+function updateStatus(message) {
+  document.getElementById("statusText").textContent = message;
+}
+
+function formatSize(bytes = 0) {
+  if (!bytes) return "0 B";
+  const units = ["B", "KB", "MB", "GB"];
+  let value = bytes;
+  let index = 0;
+  while (value >= 1024 && index < units.length - 1) {
+    value /= 1024;
+    index += 1;
+  }
+  return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
+}
+
+function formatDate(date) {
+  if (!date) return "Unknown";
+  return new Date(date).toLocaleDateString();
+}
+
+function getExtension(name = "") {
+  const split = name.split(".");
+  if (split.length < 2) return "FILE";
+  return split.pop().slice(0, 4).toUpperCase();
+}
+
+async function logout() {
+  if (demoMode) {
+    window.location.href = "login.html";
+    return;
+  }
+
+  await supabaseClient.auth.signOut();
+  window.location.href = "login.html";
+}
 
EOF
)
