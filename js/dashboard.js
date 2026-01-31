const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const fileGrid = document.getElementById("fileGrid");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const filePath = `${user.id}/${file.name}`;

    const { error } = await window.supabaseClient
        .storage
        .from("files")
        .upload(filePath, file);

    if (error) {
        alert(error.message);
    } else {
        alert("Upload successful!");
        loadFiles();
    }
};

async function loadFiles() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return;

    const { data } = await window.supabaseClient
        .storage
        .from("files")
        .list(user.id);

    fileGrid.innerHTML = "";

    data?.forEach(file => {
        const div = document.createElement("div");
        div.textContent = file.name;

        div.onclick = async () => {
            const { data } = window.supabaseClient
                .storage
                .from("files")
                .getPublicUrl(`${user.id}/${file.name}`);

            window.open(data.publicUrl, "_blank");
        };

        fileGrid.appendChild(div);
    });
}

loadFiles();
