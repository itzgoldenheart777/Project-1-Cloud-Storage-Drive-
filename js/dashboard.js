const fileGrid = document.getElementById("fileGrid");
const fileInput = document.getElementById("fileInput");
const viewTitle = document.getElementById("viewTitle");

let currentFolder = "";
let currentUser = null;

init();

async function init() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
    document.getElementById("userEmail").innerText = user.email;
    loadMyDrive();
}

fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const path = `${currentUser.id}/${currentFolder}${file.name}`;

    const { error } = await supabaseClient.storage
        .from("files")
        .upload(path, file);

    if (error) alert(error.message);
    else loadMyDrive();
};

async function loadMyDrive() {
    viewTitle.innerText = "My Drive";
    currentFolder = "";
    const { data } = await supabaseClient.storage
        .from("files")
        .list(currentUser.id);

    renderFiles(data);
}

async function openFolder(folderName) {
    currentFolder = folderName + "/";
    viewTitle.innerText = folderName;

    const { data } = await supabaseClient.storage
        .from("files")
        .list(`${currentUser.id}/${folderName}`);

    renderFiles(data);
}

function renderFiles(files) {
    fileGrid.innerHTML = "";

    files.forEach(file => {
        const card = document.createElement("div");
        card.className = "file-card";

        const isFolder = !file.name.includes(".");

        card.innerHTML = `
            <div class="file-menu" onclick="toggleDropdown(this)">⋮</div>
            <div class="dropdown">
                <button onclick="renameFile('${file.name}')">Rename</button>
                <button onclick="deleteFile('${file.name}')">Delete</button>
            </div>
            <h4 onclick="${isFolder ? `openFolder('${file.name}')` : `openFile('${file.name}')`}">
                ${file.name}
            </h4>
        `;

        fileGrid.appendChild(card);
    });
}

async function openFile(name) {
    const { data } = supabaseClient.storage
        .from("files")
        .getPublicUrl(`${currentUser.id}/${currentFolder}${name}`);

    window.open(data.publicUrl, "_blank");
}

async function deleteFile(name) {
    const path = `${currentUser.id}/${currentFolder}${name}`;

    const { error } = await supabaseClient.storage
        .from("files")
        .remove([path]);

    if (error) alert(error.message);
    else loadMyDrive();
}

async function renameFile(oldName) {
    const newName = prompt("Enter new name (without extension):");
    if (!newName) return;

    const extension = oldName.includes(".")
        ? "." + oldName.split(".").pop()
        : "";

    const newFullName = newName + extension;

    const oldPath = `${currentUser.id}/${currentFolder}${oldName}`;
    const newPath = `${currentUser.id}/${currentFolder}${newFullName}`;

    await supabaseClient.storage
        .from("files")
        .move(oldPath, newPath);

    loadMyDrive();
}

async function createFolder() {
    const folderName = prompt("Folder name:");
    if (!folderName) return;

    const path = `${currentUser.id}/${folderName}/.keep`;

    await supabaseClient.storage
        .from("files")
        .upload(path, new Blob([""]));

    loadMyDrive();
}

function toggleDropdown(el) {
    const dropdown = el.nextElementSibling;
    dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
}

function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}
