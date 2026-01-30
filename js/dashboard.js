const fileInput = document.getElementById("fileInput");
const fileGrid = document.getElementById("fileGrid");

checkAuth();
loadFiles();

async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
  }
}

function triggerUpload() {
  fileInput.click();
}

fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const { data: { user } } = await supabase.auth.getUser();

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("files")
    .upload(filePath, file);

  if (error) {
    alert(error.message);
  } else {
    alert("Upload successful");
    loadFiles();
  }
};

async function loadFiles() {
  fileGrid.innerHTML = "";

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.storage
    .from("files")
    .list(user.id);

  if (error) return;

  data.forEach(file => {
    const div = document.createElement("div");
    div.className = "file";
    div.innerText = file.name;

    div.onclick = async () => {
      const { data } = supabase.storage
        .from("files")
        .getPublicUrl(`${user.id}/${file.name}`);

      window.open(data.publicUrl, "_blank");
    };

    fileGrid.appendChild(div);
  });
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}
