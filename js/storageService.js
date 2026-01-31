// js/storageService.js

const storage = window.supabaseClient.storage;
const BUCKET = "files";

// Get logged-in user ID
async function getUserId() {
  const { data } = await window.supabaseClient.auth.getUser();
  return data.user.id;
}

// List files in folder
async function listFiles(path = "") {
  const userId = await getUserId();

  const { data, error } = await storage
    .from(BUCKET)
    .list(`${userId}/${path}`, {
      sortBy: { column: "created_at", order: "desc" }
    });

  if (error) throw error;

  return data;
}

// Upload file
async function uploadFile(path, file) {
  const userId = await getUserId();
  const fullPath = `${userId}/${path}${file.name}`;

  const { error } = await storage
    .from(BUCKET)
    .upload(fullPath, file);

  if (error) throw error;
}

// Delete file
async function deleteFile(fullPath) {
  const { error } = await storage.from(BUCKET).remove([fullPath]);
  if (error) throw error;
}

// Move / Rename
async function moveFile(oldPath, newPath) {
  const { error } = await storage.from(BUCKET).move(oldPath, newPath);
  if (error) throw error;
}

// Get public preview URL
function getPublicUrl(fullPath) {
  const { data } = storage.from(BUCKET).getPublicUrl(fullPath);
  return data.publicUrl;
}
