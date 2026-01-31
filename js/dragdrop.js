// js/dragdrop.js

function initDragDrop(getCurrentPath, refresh) {
  const zone = document.getElementById("dropZone");

  zone.addEventListener("dragover", e => {
    e.preventDefault();
    zone.classList.add("dragging");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragging");
  });

  zone.addEventListener("drop", async e => {
    e.preventDefault();
    zone.classList.remove("dragging");

    const files = e.dataTransfer.files;

    for (let file of files) {
      await uploadFile(getCurrentPath(), file);
    }

    refresh();
  });
}
