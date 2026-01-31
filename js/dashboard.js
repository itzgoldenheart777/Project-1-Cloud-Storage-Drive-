/* =====================================================
   GLOBAL STATE
===================================================== */

window.currentUser = null;
window.currentFolder = "";
window.currentTab = "home";

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof supabaseClient === "undefined") {
        alert("Supabase client not loaded.");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        location.href = "login.html";
        return;
    }

    window.currentUser = user;

    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.innerText = user.email;

    setupUpload();
    switchTab("home");

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".more-btn")) {
            closeMenus();
        }
    });
});

/* =====================================================
   TAB SWITCHING
===================================================== */

window.switchTab = function(tab) {
    window.currentTab = tab;

    document.querySelectorAll(".nav-item")
        .forEach(el => el.classList.remove("active"));

    if (tab === "home") {
        document.getElementById("navHome").classList.add("active");
        document.getElementById("pageTitle").innerText = "Home";
        loadRecent();
    }

    if (tab === "mydrive") {
        document.getElementById("navMyDrive").classList.add("active");
        document.getElementById("pageTitle").innerText = "My Drive";
        loadDrive("");
    }
};

/* =====================================================
   LOADERS
===================================================== */

async function loadDrive(folder) {

    window.currentFolder = folder;

    const path = window.currentUser.id +
        (folder ? "/" + folder : "");

    const { data, error } = await supabaseClient
        .storage
        .from("files")
        .list(path);

    if (error) {
        alert(error.message);
        return;
    }

    renderFiles(data);
}

async function loadRecent() {

    const { data } = await supabaseClient
        .storage
        .from("files")
        .list(window.currentUser.id, {
            sortBy: { column: "created_at", order: "desc" }
        });

    renderFiles(data.slice(0, 8));
}

/* =====================================================
   RENDER
===================================================== */

async function renderFiles(files) {

    const grid = document.getElementById("fileGrid");
    grid.innerHTML = "";

    files.forEach(file => {

        if (file.name === ".keep") return;

        const isFolder = !file.name.includes(".");

        const card = document.createElement("div");
        card.className = "file-card";

        card.ondblclick = () =>
            isFolder ? openFolder(file.name) : openFile(file.name);

        card.innerHTML = `
            <div class="file-preview">
                <span class="material-icons-outlined">
                    ${isFolder ? "folder" : "insert_drive_file"}
                </span>
            </div>

            <div class="file-footer">
                <span class="file-name">${file.name}</span>
                <button class="more-btn"
                    onclick="openMenu(event,'${file.name}')">
                    <span class="material-icons-outlined">
                        more_vert
                    </span>
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

/* =====================================================
   FILE ACTIONS
===================================================== */

window.openFile = function(name) {

    const fullPath =
        window.currentUser.id +
        (window.currentFolder
            ? "/" + window.currentFolder
            : "") +
        "/" + name;

    const { data } =
        supabaseClient.storage
            .from("files")
            .getPublicUrl(fullPath);

    window.open(data.publicUrl, "_blank");
};

window.openFolder = function(folder) {

    const newPath =
        window.currentFolder
            ? window.currentFolder + "/" + folder
            : folder;

    loadDrive(newPath);
};

window.deleteFile = async function(name) {

    if (!confirm("Delete this file?")) return;

    const fullPath =
        window.currentUser.id +
        (window.currentFolder
            ? "/" + window.currentFolder
            : "") +
        "/" + name;

    const { error } =
        await supabaseClient.storage
            .from("files")
            .remove([fullPath]);

    if (error) alert(error.message);

    refresh();
};

window.renameFile = async function(oldName) {

    const newName = prompt("New name:");
    if (!newName) return;

    const base =
        window.currentUser.id +
        (window.currentFolder
            ? "/" + window.currentFolder
            : "");

    await supabaseClient.storage
        .from("files")
        .move(
            base + "/" + oldName,
            base + "/" + newName
        );

    refresh();
};

window.moveFile = async function(name) {

    const folder = prompt("Move to folder:");
    if (!folder) return;

    const base = window.currentUser.id;

    const oldPath =
        base +
        (window.currentFolder
            ? "/" + window.currentFolder
            : "") +
        "/" + name;

    const newPath =
        base + "/" + folder + "/" + name;

    await supabaseClient.storage
        .from("files")
        .move(oldPath, newPath);

    refresh();
};

window.createFolder = async function() {

    const name = prompt("Folder name:");
    if (!name) return;

    const path =
        window.currentUser.id +
        (window.currentFolder
            ? "/" + window.currentFolder
            : "") +
        "/" + name + "/.keep";

    await supabaseClient.storage
        .from("files")
        .upload(path, new Blob([""]));

    refresh();
};

/* =====================================================
   UPLOAD
===================================================== */

function setupUpload() {

    const input = document.getElementById("fileInput");

    if (!input) return;

    input.onchange = async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        const path =
            window.currentUser.id +
            (window.currentFolder
                ? "/" + window.currentFolder
                : "") +
            "/" + file.name;

        const { error } =
            await supabaseClient.storage
                .from("files")
                .upload(path, file, { upsert: true });

        if (error) alert(error.message);

        refresh();
    };
}

/* =====================================================
   MENU
===================================================== */

window.openMenu = function(event, fileName) {

    event.stopPropagation();
    closeMenus();

    const menu = document.createElement("div");
    menu.className = "context-menu";

    menu.innerHTML = `
        <div onclick="renameFile('${fileName}')">Rename</div>
        <div onclick="moveFile('${fileName}')">Move</div>
        <div onclick="deleteFile('${fileName}')">Delete</div>
    `;

    document.body.appendChild(menu);

    menu.style.top = event.pageY + "px";
    menu.style.left = event.pageX + "px";
};

function closeMenus() {
    document
        .querySelectorAll(".context-menu")
        .forEach(m => m.remove());
}

/* =====================================================
   UTIL
===================================================== */

function refresh() {
    if (window.currentTab === "home")
        loadRecent();
    else
        loadDrive(window.currentFolder);
}

window.logout = async function() {
    await supabaseClient.auth.signOut();
    location.href = "login.html";
};

window.toggleProfileMenu = function() {
    document
        .getElementById("profileMenu")
        .classList.toggle("hidden");
};
