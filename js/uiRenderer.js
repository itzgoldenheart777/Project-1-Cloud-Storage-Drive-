function renderFiles(files) {
  const container = document.getElementById("fileContainer");
  container.innerHTML = "";

  files.forEach(file => {
    const div = document.createElement("div");
    div.className = "file-card";
    div.innerHTML = `
      <div>${file.name}</div>
      <button onclick="showMenu('${file.id}','${file.path}')">⋮</button>
    `;
    container.appendChild(div);
  });
}
