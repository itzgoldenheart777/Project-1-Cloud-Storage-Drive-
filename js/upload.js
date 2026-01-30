async function uploadFile(file) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    alert("Please login first");
    return;
  }

  const filePath = `${user.id}/${Date.now()}_${file.name}`;

  const { error } = await supabase.storage
    .from("files")
    .upload(filePath, file);

  if (error) {
    alert(error.message);
  } else {
    alert("File uploaded successfully");
    listFiles();
  }
}
