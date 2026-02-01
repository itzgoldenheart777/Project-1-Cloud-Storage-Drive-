document.addEventListener("DOMContentLoaded", init);

let currentUser = null;

/* ---------------- INIT ---------------- */

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

/* ---------------- AVATAR MENU ---------------- */

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

async function loadUserInfo() {
  document.getElementById("emailField").value = currentUser.email;
  document.getElementById("displayName").value =
    currentUser.user_metadata?.full_name || "";

  if (currentUser.user_metadata?.avatar_url) {
    document.getElementById("userAvatar").src =
      currentUser.user_metadata.avatar_url;

    document.getElementById("avatarPreview").src =
      currentUser.user_metadata.avatar_url;
  }
}

/* ---------------- PROFILE ---------------- */

window.openProfile = function () {
  document.getElementById("profileModal").classList.remove("hidden");
};

window.closeProfile = function () {
  document.getElementById("profileModal").classList.add("hidden");
};

window.viewDetails = function () {
  alert(
    `User: ${currentUser.user_metadata?.full_name || "N/A"}\n` +
    `Email: ${currentUser.email}\n` +
    `ID: ${currentUser.id}`
  );
};

window.saveProfile = async function () {
  const full_name = document.getElementById("displayName").value;
  const avatarFile = document.getElementById("avatarInput").files[0];

  let avatar_url = currentUser.user_metadata?.avatar_url || null;

  if (avatarFile) {
    const filePath = `avatars/${currentUser.id}`;
    const { error } = await supabaseClient.storage
      .from("user-files")
      .upload(filePath, avatarFile, { upsert: true });

    if (error) {
      alert(error.message);
      return;
    }

    const { data } = supabaseClient.storage
      .from("user-files")
      .getPublicUrl(filePath);

    avatar_url = data.publicUrl;
  }

  const { error } = await supabaseClient.auth.updateUser({
    data: { full_name, avatar_url }
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Profile updated");
  closeProfile();
  location.reload();
};

/* ---------------- PASSWORD RESET ---------------- */

window.resetPassword = async function () {
  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(currentUser.email, {
      redirectTo: window.location.origin + "/reset.html"
    });

  if (error) alert(error.message);
  else alert("Password reset email sent.");
};

/* ---------------- FILE UPLOAD ---------------- */

window.uploadFile = async function () {
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
};

/* ---------------- FILE LIST ---------------- */

async function loadFiles() {
  const { data, error } = await supabaseClient.storage
    .from("user-files")
    .list(currentUser.id);

  const container = document.getElementById("fileList");
  container.innerHTML = "";

  if (!data || data.length === 0) {
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

window.downloadFile = async function (name) {
  const { data } = await supabaseClient.storage
    .from("user-files")
    .createSignedUrl(`${currentUser.id}/${name}`, 60);

  window.open(data.signedUrl, "_blank");
};

/* ---------------- DELETE ---------------- */

window.deleteFile = async function (name) {
  await supabaseClient.storage
    .from("user-files")
    .remove([`${currentUser.id}/${name}`]);

  loadFiles();
};

/* ---------------- LOGOUT ---------------- */

window.logout = async function () {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
};
