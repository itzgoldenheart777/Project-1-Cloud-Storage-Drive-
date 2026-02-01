document.addEventListener("DOMContentLoaded", checkUser);

async function checkUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
  } else {
    loadFiles();
  }
}

async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];

  if (!file) {
    alert("Please select a file");
    return;
  }

  const { data: { user } } = await supabaseClient.auth.getUser();

  const filePath = `${user.id}/${file.name}`;

  const { error } = await supabaseClient.storage
    .from("user-files")
    .upload(filePath, file);

  if (error) {
    alert(error.message);
  } else {
    loadFiles();
  }
}

async function loadFiles() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  const { data, error } = await supabaseClient.storage
    .from("user-files")
    .list(user.id);

  if (error) {
    console.error(error.message);
    return;
  }

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
  const { data: { user } } = await supabaseClient.auth.getUser();

  const { data, error } = await supabaseClient.storage
    .from("user-files")
    .createSignedUrl(`${user.id}/${name}`, 60);

  if (error) {
    alert(error.message);
    return;
  }

  window.open(data.signedUrl, "_blank");
}

async function deleteFile(name) {
  const { data: { user } } = await supabaseClient.auth.getUser();

  const { error } = await supabaseClient.storage
    .from("user-files")
    .remove([`${user.id}/${name}`]);

  if (error) {
    alert(error.message);
  } else {
    loadFiles();
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}
