document.addEventListener("DOMContentLoaded", checkUser);

async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
  } else {
    loadFiles();
  }
}

async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];
  const { data: { user } } = await supabase.auth.getUser();

  const filePath = `${user.id}/${file.name}`;

  const { error } = await supabase.storage
    .from("user-files")
    .upload(filePath, file);

  if (!error) {
    loadFiles();
  } else {
    alert(error.message);
  }
}

async function loadFiles() {
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase.storage
    .from("user-files")
    .list(user.id);

  const container = document.getElementById("fileList");
  container.innerHTML = "";

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

async function downloadFile(name) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase.storage
    .from("user-files")
    .createSignedUrl(`${user.id}/${name}`, 60);

  window.open(data.signedUrl, "_blank");
}

async function deleteFile(name) {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.storage
    .from("user-files")
    .remove([`${user.id}/${name}`]);

  loadFiles();
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}
