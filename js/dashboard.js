const supabaseClient = supabase.createClient(
  "https://woysaoheokhipqpfphpr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXNhb2hlb2toaXBxcGZwaHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDg0NDcsImV4cCI6MjA4NTMyNDQ0N30.IuWML5hwlXmo6yONo5JaYfzsypkajyxZ29sfyjaRqcA"

);

//const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXNhb2hlb2toaXBxcGZwaHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDg0NDcsImV4cCI6MjA4NTMyNDQ0N30.IuWML5hwlXmo6yONo5JaYfzsypkajyxZ29sfyjaRqcA";
//"sb_publishable_WbweOMELckXb1bfnEA-g9A_YF3NwmSR"

let currentUser = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  loadUserInfo();
  loadFiles();
  setupAvatarMenu();
}

/* ---------------- MENU ---------------- */

function setupAvatarMenu() {
  const avatarBtn = document.getElementById("avatarBtn");
  const menu = document.getElementById("userMenu");

  avatarBtn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!avatarBtn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
}

/* ---------------- USER INFO ---------------- */

function loadUserInfo() {
  document.getElementById("emailField").value = currentUser.email;
  document.getElementById("displayName").value =
    currentUser.user_metadata?.full_name || "";
}

/* ---------------- PROFILE ---------------- */

function openProfile() {
  document.getElementById("profileModal").classList.remove("hidden");
}

function closeProfile() {
  document.getElementById("profileModal").classList.add("hidden");
}

async function saveProfile() {
  const full_name = document.getElementById("displayName").value;

  const { error } = await supabaseClient.auth.updateUser({
    data: { full_name }
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Profile updated");
  closeProfile();
}

/* ---------------- PASSWORD RESET ---------------- */

async function resetPassword() {
  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(currentUser.email, {
      redirectTo: window.location.origin + "/reset.html"
    });

  if (error) alert(error.message);
  else alert("Password reset email sent.");
}

/* ---------------- FILE UPLOAD ---------------- */

async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("Select a file");
    return;
  }

  const filePath = `${currentUser.id}/${file.name}`;

  const { error } = await supabaseClient.storage
    .from("user-files")
    .upload(filePath, file);

  if (error) alert(error.message);
  else loadFiles();
}

/* ---------------- FILE LIST ---------------- */

async function loadFiles() {
  const { data, error } = await supabaseClient.storage
    .from("user-files")
    .list(currentUser.id);

  const container = document.getElementById("fileList");
  container.innerHTML = "";

  if (error) {
    console.error(error);
    return;
  }

  if (!data.length) {
    container.innerHTML = "<p>No files uploaded</p>";
    return;
  }

  data.forEach(file => {
    const div = document.createElement("div");
    div.className = "file-card";

    div.innerHTML = `
      <p>${file.name}</p>
      <button onclick="downloadFile('${file.name}')">Download</button>
      <button onclick="deleteFile('${file.name}')">Delete</button>
    `;

    container.appendChild(div);
  });
}

/* ---------------- DOWNLOAD ---------------- */

async function downloadFile(name) {
  const { data } = await supabaseClient.storage
    .from("user-files")
    .createSignedUrl(`${currentUser.id}/${name}`, 60);

  window.open(data.signedUrl, "_blank");
}

/* ---------------- DELETE ---------------- */

async function deleteFile(name) {
  await supabaseClient.storage
    .from("user-files")
    .remove([`${currentUser.id}/${name}`]);

  loadFiles();
}

/* ---------------- LOGOUT ---------------- */

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}
