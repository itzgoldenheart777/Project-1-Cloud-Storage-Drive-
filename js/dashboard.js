// js/dashboard.js

let currentPath = "";

document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  await loadFiles();

  initDragDrop(() => currentPath, loadFiles);

  document.getElementById("breadcrumb").addEventListener("click", e => {
    if (e.target.dataset.path !== undefined) {
      currentPath = e.target.dataset.path;
      loadFiles();
    }
  });
});

async function loadFiles() {
  const userId = await getUserId();
  const files = await listFiles(currentPath);

  renderBreadcrumb(currentPath);
  renderFiles(files, currentPath, userId);
}
