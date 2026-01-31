const fileGrid = document.getElementById("fileGrid");
const fileInput = document.getElementById("fileInput");
const viewTitle = document.getElementById("viewTitle");
// Global State
let currentFolder = "";
let currentUser = null;
let currentTab = "home"; // 'home' or 'mydrive'

// Initialize on Load
window.addEventListener('DOMContentLoaded', init);

async function init() {
    // 1. Check Auth
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
    document.getElementById('userEmail').innerText = user.email;

    // 2. Setup Click Outside Listener (for closing context menus)
    document.addEventListener('click', (e) => {
        closeAllMenus();
        if (!e.target.closest('.profile-container')) {
            document.getElementById('profileMenu').classList.add('hidden');
        }
    });

    // 3. Load Initial View
    switchTab('home');
}

// --- Navigation Logic ---
function switchTab(tab) {
    currentTab = tab;
    // Update Sidebar UI
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(tab === 'home') {
        document.getElementById('navHome').classList.add('active');
        document.getElementById('pageTitle').innerText = "Home";
        document.getElementById('suggestedSection').style.display = "block";
        loadRecentFiles(); // Home shows recent stuff
    } else if (tab === 'mydrive') {
        document.getElementById('navMyDrive').classList.add('active');
        document.getElementById('pageTitle').innerText = "My Drive";
        document.getElementById('suggestedSection').style.display = "none";
        loadMyDrive(""); // Reset to root of My Drive
    }
}

// --- File Loading ---

// Logic for "My Drive" (Folder Structure)
async function loadMyDrive(folderPath) {
    currentFolder = folderPath;
    const breadcrumb = folderPath ? `My Drive > ${folderPath}` : "My Drive";
    document.getElementById('pageTitle').innerText = breadcrumb;

    // Fetch from Supabase
    const { data, error } = await supabaseClient
        .storage
        .from('files')
        .list(currentUser.id + "/" + currentFolder);

    if (error) {
        console.error("Error loading files", error);
        return;
    }

    renderFiles(data, 'fileGrid');
}

// Logic for "Home" (Recent Files - Flattened View)
async function loadRecentFiles() {
    // Note: Supabase Storage .list() isn't recursive by default in all clients.
    // This is a simplified version fetching root. For real recursive "Recent", 
    // you'd typically query a database table that tracks file uploads.
    // For this demo, we will just load the root folder as 'Recent'.
    
    const { data, error } = await supabaseClient
        .storage
        .from('files')
        .list(currentUser.id + "/", { sortBy: { column: 'created_at', order: 'desc' } });

    if (data) {
        // Show top 4 in suggested
        renderFiles(data.slice(0, 4), 'suggestedGrid');
        // Show rest in files
        renderFiles(data, 'fileGrid');
    }
}

// --- Rendering ---
function renderFiles(files, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!files || files.length === 0) {
        container.innerHTML = "<p style='color:#666; padding:20px'>No files found.</p>";
        return;
    }

    files.forEach(file => {
        // Skip .emptyFolderPlaceholder if you use that hack
        if(file.name === ".emptyFolderPlaceholder") return;

        const isFolder = !file.metadata; // Supabase folders often lack metadata in list()
        // Simple icon logic
        let icon = "description";
        let color = "#5f6368";
        if(file.name.endsWith('.jpg') || file.name.endsWith('.png')) { icon = "image"; color = "#d93025"; }
        else if(file.name.endsWith('.pdf')) { icon = "picture_as_pdf"; color = "#d93025"; }
        else if(isFolder) { icon = "folder"; color = "#5f6368"; }

        const card = document.createElement('div');
        card.className = "file-card";
        
        // Handle Folder Click vs File Open
        if (isFolder) {
            card.ondblclick = () => openFolder(file.name);
        } else {
            card.ondblclick = () => openFile(file.name);
        }

        card.innerHTML = `
            <div class="file-preview">
                <span class="material-icons-outlined file-icon-large" style="color: ${color}">${icon}</span>
            </div>
            <div class="file-footer">
                <div class="file-name-row">
                    <span class="material-icons-outlined file-type-icon" style="color: ${color}">${icon}</span>
                    <span class="file-name" title="${file.name}">${file.name}</span>
                </div>
                <button class="more-btn" onclick="openContextMenu(event, '${file.name}')">
                    <span class="material-icons-outlined">more_vert</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Context Menu Logic ---
function openContextMenu(event, fileName) {
    event.stopPropagation(); // Prevent closing immediately
    closeAllMenus(); // Close others

    // Create Menu HTML
    const menu = document.createElement('div');
    menu.className = "context-menu visible";
    menu.style.top = `${event.clientY}px`;
    menu.style.left = `${event.clientX}px`; // Position at mouse

    // Logic to separate name and extension
    const parts = fileName.split('.');
    const ext = parts.length > 1 ? '.' + parts.pop() : ''; 
    const nameNoExt = parts.join('.');

    menu.innerHTML = `
        <div class="menu-item" onclick="alert('Preview functionality here')">
            <span class="material-icons-outlined">visibility</span> Preview
        </div>
        <div class="menu-item" onclick="triggerRename('${nameNoExt}', '${ext}', '${fileName}')">
            <span class="material-icons-outlined">drive_file_rename_outline</span> Rename
        </div>
        <div class="menu-item" onclick="deleteFile('${fileName}')">
             <span class="material-icons-outlined">delete</span> Remove
        </div>
        <div class="menu-item">
             <span class="material-icons-outlined">share</span> Share
        </div>
    `;

    document.body.appendChild(menu);
}

function closeAllMenus() {
    document.querySelectorAll('.context-menu').forEach(el => el.remove());
}

// --- File Actions ---

// 1. Upload
const fileInput = document.getElementById('fileInput');
fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const path = currentFolder ? `${currentUser.id}/${currentFolder}/${file.name}` : `${currentUser.id}/${file.name}`;
    
    const { error } = await supabaseClient.storage.from('files').upload(path, file);
    if (error) alert("Upload Failed: " + error.message);
    else {
        // Refresh view
        if(currentTab === 'home') loadRecentFiles();
        else loadMyDrive(currentFolder);
    }
};

// 2. Folder Navigation
function openFolder(folderName) {
    const newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    loadMyDrive(newPath);
}

// 3. Create Folder
async function createFolder() {
    const folderName = prompt("New folder name:");
    if (!folderName) return;

    // Supabase workaround: Upload an empty placeholder file to create the folder path
    const path = currentFolder 
        ? `${currentUser.id}/${currentFolder}/${folderName}/.emptyFolderPlaceholder`
        : `${currentUser.id}/${folderName}/.emptyFolderPlaceholder`;

    const { error } = await supabaseClient.storage.from('files').upload(path, new Blob([""]));
    if(!error) loadMyDrive(currentFolder);
}

// 4. Delete
async function deleteFile(fileName) {
    if(!confirm(`Delete ${fileName}?`)) return;

    const path = currentFolder ? `${currentUser.id}/${currentFolder}/${fileName}` : `${currentUser.id}/${fileName}`;
    const { error } = await supabaseClient.storage.from('files').remove([path]);
    
    if(error) alert("Error deleting");
    else {
        closeAllMenus();
        if(currentTab === 'home') loadRecentFiles();
        else loadMyDrive(currentFolder);
    }
}

// 5. Rename (Smart Rename)
async function triggerRename(oldNameNoExt, ext, oldFullName) {
    const newNameNoExt = prompt("Rename file (extension will be preserved):", oldNameNoExt);
    if (!newNameNoExt || newNameNoExt === oldNameNoExt) return;

    const newFullName = newNameNoExt + ext;
    
    const oldPath = currentFolder ? `${currentUser.id}/${currentFolder}/${oldFullName}` : `${currentUser.id}/${oldFullName}`;
    const newPath = currentFolder ? `${currentUser.id}/${currentFolder}/${newFullName}` : `${currentUser.id}/${newFullName}`;

    const { error } = await supabaseClient.storage.from('files').move(oldPath, newPath);
    if(error) alert("Rename failed: " + error.message);
    else {
        closeAllMenus();
        if(currentTab === 'home') loadRecentFiles();
        else loadMyDrive(currentFolder);
    }
}

// 6. Open File
async function openFile(fileName) {
    const path = currentFolder ? `${currentUser.id}/${currentFolder}/${fileName}` : `${currentUser.id}/${fileName}`;
    
    const { data } = supabaseClient.storage.from('files').getPublicUrl(path);
    if(data) window.open(data.publicUrl, '_blank');
}

// --- User Actions ---
function toggleProfileMenu() {
    const menu = document.getElementById('profileMenu');
    menu.classList.toggle('hidden');
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}
