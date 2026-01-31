async function deleteFile(id, path) {
  await supabaseClient.storage.from("drive").remove([path]);
  await supabaseClient.from("files").delete().eq("id", id);
  loadFiles();
}

async function renameFile(id, newName) {
  await supabaseClient.from("files").update({ name: newName }).eq("id", id);
  loadFiles();
}
