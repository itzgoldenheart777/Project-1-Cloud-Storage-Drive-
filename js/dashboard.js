document.addEventListener("DOMContentLoaded", checkUser);

async function checkUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    window.location.href = "login.html";
    return;
  }

  loadFiles();
}

/* ============================= */
/*          UPLOAD FILE          */
/* ============================= */

window.uploadFile = async function () {
  const input = document.getElementById("fileInput");

  if (!input.files.length) {
    alert("Please select a file");
    return;
  }

  const file = input.files[0];

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    alert("User not authenticated");
    return;
  }

  const filePath = `${user.id}/${file.name}`;

  const { error } = await supabaseClient.storage
    .from("files")   // ✅ correct bucket name
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    console.error("Upload error:", error);
    alert(error.message);
    return;
  }

  alert("Upload successful");
  loadFiles();
};

/* ============================= */
/*          LOAD FILES           */
/* ============================= */

async function loadFiles() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data, error } = await supabaseClient.storage
    .from("files")   // ✅ correct bucket
    .list(user.id);

  if (error) {
    console.error("List error:", error);
    alert(error.message);
    return;
  }

  const container = document.getElementById("fileList");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>No files uploaded yet.</p>";
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

/* ============================= */
/*         DOWNLOAD FILE         */
/* ============================= */

window.downloadFile = async function (name) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data, error } = await supabaseClient.storage
    .from("files")   // ✅ correct bucket
    .createSignedUrl(`${user.id}/${name}`, 60);

  if (error) {
    console.error("Download error:", error);
    alert(error.message);
    return;
  }

  window.open(data.signedUrl, "_blank");
};

/* ============================= */
/*          DELETE FILE          */
/* ============================= */

window.deleteFile = async function (name) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { error } = await supabaseClient.storage
    .from("files")   // ✅ correct bucket
    .remove([`${user.id}/${name}`]);

  if (error) {
    console.error("Delete error:", error);
    alert(error.message);
    return;
  }

  loadFiles();
};

/* ============================= */
/*            LOGOUT             */
/* ============================= */

window.logout = async function () {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
};
