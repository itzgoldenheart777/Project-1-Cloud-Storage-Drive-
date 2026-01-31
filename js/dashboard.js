async function init() {
  const { data } = await window.supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userEmail").innerText =
    data.session.user.email;

  loadFiles();
}

async function loadFiles() {
  const { data } =
    await window.supabaseClient.storage.from("drive").list();

  const grid = document.getElementById("fileGrid");
  grid.innerHTML = "";

  data.forEach(file => {
    const div = document.createElement("div");
    div.className = "file-card";
    div.innerHTML = `
      <p>${file.name}</p>
      <button onclick="deleteFile('${file.name}')">Delete</button>
    `;
    grid.appendChild(div);
  });
}

async function deleteFile(name) {
  await window.supabaseClient.storage.from("drive").remove([name]);
  loadFiles();
}

async function logout() {
  await window.supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

document.getElementById("fileInput").addEventListener("change", async e => {
  const files = [...e.target.files];

  for (const file of files) {
    await window.supabaseClient.storage
      .from("drive")
      .upload(file.name, file);
  }

  loadFiles();
});

init();
