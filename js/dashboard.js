document.addEventListener("DOMContentLoaded", checkUser);

async function checkUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
  } else {
    loadFiles();
  }
}

window.uploadFile = async function () {
  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("Select a file");
    return;
  }

  const { data: { user } } = await supabaseClient.auth.getUser();
  const filePath = `${user.id}/${file.name}`;

  const { error } = await supabaseClient.storage
    .from("user-files")
    .upload(filePath, file);

  if (error) alert(error.message);
  else loadFiles();
};

window.logout = async function () {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
};

window.downloadFile = async function (name) {
  const { data: { user } } = await supabaseClient.auth.getUser();

  const { data } = await supabaseClient.storage
    .from("user-files")
    .createSignedUrl(`${user.id}/${name}`, 60);

  window.open(data.signedUrl, "_blank");
};

window.deleteFile = async function (name) {
  const { data: { user } } = await supabaseClient.auth.getUser();

  await supabaseClient.storage
    .from("user-files")
    .remove([`${user.id}/${name}`]);

  loadFiles();
};

async function loadFiles() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  const { data } = await supabaseClient.storage
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
