const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const fileGrid = document.getElementById("fileGrid");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        alert("Please login");
        window.location.href = "login.html";
        return;
    }

    const filePath = `${user.id}/${file.name}`;

    const { error } = await supabaseClient.storage
        .from("files")
        .upload(filePath, file);

    if (error) {
        alert(error.message);
    } else {
        loadFiles();
    }
};

async function loadFiles() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data } = await supabaseClient.storage
        .from("files")
        .list(user.id);

    fileGrid.innerHTML = "";

    data.forEach(file => {
        const card = document.createElement("div");
        card.className = "file-card";

        card.innerHTML = `
            <span class="menu-btn" onclick="toggleMenu(this)">⋮</span>
            <div class="dropdown">
                <button onclick="openFile('${file.name}')">Open</button>
                <button onclick="deleteFile('${file.name}')">Delete</button>
            </div>
            <h4>${file.name}</h4>
        `;

        fileGrid.appendChild(card);
    });
}

function toggleMenu(btn) {
    const dropdown = btn.nextElementSibling;
    dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
}

async function openFile(fileName) {
    const { data: { user } } = await supabaseClient.auth.getUser();

    const { data } = supabaseClient.storage
        .from("files")
        .getPublicUrl(`${user.id}/${fileName}`);

    window.open(data.publicUrl, "_blank");
}

async function deleteFile(fileName) {
    const { data: { user } } = await supabaseClient.auth.getUser();

    await supabaseClient.storage
        .from("files")
        .remove([`${user.id}/${fileName}`]);

    loadFiles();
}

function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}

async function loadUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        document.getElementById("userEmail").innerText = user.email;
    }
}

loadFiles();
loadUser();
