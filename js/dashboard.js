const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const fileGrid = document.getElementById("fileGrid");

uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("files").upload(filePath, file);
    if (error) {
        alert(error.message);
    } else {
        alert("Uploaded successfully");
        loadFiles();
    }
};

async function loadFiles() {
    fileGrid.innerHTML = "";
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    const { data } = await supabase.storage.from("files").list(user.id);
    data.forEach(file => {
        const div = document.createElement("div");
        div.className = "file";
        div.textContent = file.name;
        div.onclick = async () => {
            const { data } = supabase.storage.from("files").getPublicUrl(`${user.id}/${file.name}`);
            window.open(data.publicUrl, "_blank");
        };
        fileGrid.appendChild(div);
    });
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
    }
}

checkUser();

async function logout() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

loadFiles();


