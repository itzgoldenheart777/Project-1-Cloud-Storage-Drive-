// js/uiRenderer.js

function renderBreadcrumb(path) {
  const container = document.getElementById("breadcrumb");
  const parts = path.split("/").filter(Boolean);

  let html = `<span data-path="">My Drive</span>`;
  let cumulative = "";

  parts.forEach(part => {
    cumulative += part + "/";
    html += ` > <span data-path="${cumulative}">${part}</span>`;
  });

  container.innerHTML = html;
}

function renderFiles(files, currentPath, userId) {
  const grid = document.getElementById("fileGrid");
  grid.innerHTML = "";

  files.forEach(file => {
    const fullPath = `${userId}/${currentPath}${file.name}`;
    const ext = file.name.split(".").pop().toLowerCase();

    let preview;

    if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      preview = `<img src="${getPublicUrl(fullPath)}" class="file-thumb">`;
    } else if (ext === "pdf") {
      preview = `<div class="file-icon material-icons">picture_as_pdf</div>`;
    } else {
      preview = `<div class="file-icon material-icons">insert_drive_file</div>`;
    }

    grid.innerHTML += `
      <div class="file-card" data-name="${file.name}">
        ${preview}
        <div class="file-footer">
          <span>${file.name}</span>
          <span class="material-icons more-btn">more_vert</span>
        </div>
      </div>
    `;
  });
}
