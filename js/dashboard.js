async function init() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) window.location.href = "login.html";

  document.getElementById("userEmail").innerText =
    data.session.user.email;

  loadFiles();
}

async function loadFiles() {
  const { data } = await supabaseClient.from("files").select("*");
  renderFiles(data);
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

document.getElementById("fileInput").addEventListener("change", e => {
  [...e.target.files].forEach(file => uploadFile(file));
});

init();
