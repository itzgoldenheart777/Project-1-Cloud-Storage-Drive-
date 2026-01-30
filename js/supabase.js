const supabase = supabase.createClient(
  "https://YOUR_PROJECT_ID.supabase.co",
  "PUBLIC_ANON_KEY"
);

// Upload
async function uploadFile(file) {
  const { data, error } = await supabase
    .storage
    .from('files')
    .upload(`public/${Date.now()}-${file.name}`, file);

  if (error) alert(error.message);
  else loadFiles();
}

// List files
async function loadFiles() {
  const { data } = await supabase
    .storage
    .from('files')
    .list('public');

  fileGrid.innerHTML = "";
  data.forEach(file => {
    const div = document.createElement("div");
    div.className = "file";
    div.innerText = file.name;

    div.onclick = () => {
      const { data } = supabase
        .storage
        .from('files')
        .getPublicUrl(`public/${file.name}`);
      window.open(data.publicUrl);
    };

    fileGrid.appendChild(div);
  });
}

// Hook input
fileInput.onchange = () => uploadFile(fileInput.files[0]);
