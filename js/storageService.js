async function uploadFile(file, parentId = null) {
  const user = (await supabaseClient.auth.getUser()).data.user;
  const path = `${user.id}/${Date.now()}_${file.name}`;

  const { error } = await supabaseClient.storage
    .from("drive")
    .upload(path, file);

  if (error) return alert(error.message);

  await supabaseClient.from("files").insert({
    user_id: user.id,
    name: file.name,
    path,
    type: file.type,
    size: file.size,
    parent_id: parentId
  });

  loadFiles();
}
