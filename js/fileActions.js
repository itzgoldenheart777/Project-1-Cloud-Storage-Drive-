// js/fileActions.js

async function handleDelete(fullPath, refresh) {
  if (!confirm("Delete this file?")) return;

  await deleteFile(fullPath);
  refresh();
}

async function handleRename(oldPath, newName, refresh) {
  const ext = oldPath.split(".").pop();
  const basePath = oldPath.substring(0, oldPath.lastIndexOf("/") + 1);

  const newPath = `${basePath}${newName}.${ext}`;

  await moveFile(oldPath, newPath);
  refresh();
}
