async function init() {
  const { data } = await window.supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = "login.html";
    return;
  }

  const user = data.session.user;

  document.getElementById("userEmail").innerText =
    "Email: " + user.email;

  document.getElementById("userId").innerText =
    "User ID: " + user.id;

  loadProfilePicture(user.id);
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

async function changePassword() {
  const newPass = prompt("Enter new password:");
  if (!newPass) return;

  const { error } =
    await window.supabaseClient.auth.updateUser({
      password: newPass
    });

  if (error) alert(error.message);
  else alert("Password updated.");
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



document.getElementById("profileUpload")
  .addEventListener("change", async (e) => {

  const file = e.target.files[0];
  if (!file) return;

  const { data } = await window.supabaseClient.auth.getSession();
  const userId = data.session.user.id;

  const filePath = `profiles/${userId}.png`;

  await window.supabaseClient.storage
    .from("drive")
    .upload(filePath, file, { upsert: true });

  loadProfilePicture(userId);
});



async function loadProfilePicture(userId) {
  const { data } =
    window.supabaseClient.storage
      .from("drive")
      .getPublicUrl(`profiles/${userId}.png`);

  if (data.publicUrl) {
    document.getElementById("profilePic").src =
      data.publicUrl + "?t=" + new Date().getTime();
  }
}


function renderFiles(files) {
  const grid = document.getElementById("fileGrid");
  grid.innerHTML = "";

  files.forEach(file => {
    const div = document.createElement("div");
    div.className = "file-card";
    div.innerHTML = `
      <div style="font-size:40px;">📄</div>
      <p style="margin-top:10px;">${file.name}</p>
    `;
    grid.appendChild(div);
  });
}



