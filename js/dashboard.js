// Ensure functions are global for HTML onclick attributes
window.currentFolder = "";
window.currentUser = null;
window.currentTab = "home";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Dashboard Loaded");

    // 1. Check Auth (Assumes supabaseClient is loaded from previous script tag)
    if (typeof supabaseClient === 'undefined') {
        alert("Error: supabaseClient is not defined. Check your API keys.");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        window.location.href = "login.html"; // Redirect if not logged in
        return;
    }
    
    window.currentUser = user;
    const emailEl = document.getElementById('userEmail');
    if(emailEl) emailEl.innerText = user.email;

    // 2. Initial Load
    switchTab('home');

    // 3. Global click to close menus
    document.addEventListener('click', (e) => {
        // Close context menu if clicking outside
        if (!e.target.closest('.context-menu') && !e.target.closest('.more-btn')) {
            closeAllMenus();
        }
        // Close profile menu if clicking outside
        if (!e.target.closest('.profile-container')) {
            const pm = document.getElementById('profileMenu');
            if(pm) pm.classList.add('hidden');
        }
    });
});

// --- Tab Switching ---
window.switchTab = function(tab) {
    window.currentTab = tab;
    // UI Updates
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    if(tab === 'home') {
        document.getElementById('navHome').classList.add('active');
        document.getElementById('pageTitle').innerText = "Home";
        document.getElementById('suggestedSection').style.display = "block";
        loadRecentFiles();
    } else if (tab === 'mydrive') {
        document.getElementById('navMyDrive').classList.add('active');
        document.getElementById('pageTitle').innerText = "My Drive";
        document.getElementById('suggestedSection').style.display = "none";
        loadMyDrive(""); // Load root
    }
}

// --- Data Loading ---
async function loadMyDrive(folderPath) {
    window.currentFolder = folderPath;
    const displayTitle = folderPath ? `My Drive > ${folderPath}` : "My Drive";
    document.getElementById('pageTitle').innerText = displayTitle;

    console.log(`Loading path: ${window.currentUser.id}/${folderPath}`);

    const { data, error } = await supabaseClient
        .storage
        .from('files')
        .list(window.currentUser.id + (folderPath ? "/" + folderPath : ""));

    if (error) {
        console.error("Supabase Error:", error);
        alert("Failed to load files");
        return;
    }

    renderFiles(data, 'fileGrid');
}

async function loadRecentFiles() {
    // Fetches root files as 'Recent' for now
    const { data, error } = await supabaseClient
        .storage
        .from('files')
        .list(window.currentUser.id + "/", { sortBy: { column: 'created_at', order: 'desc' } });

    if (data) {
        renderFiles(data.slice(0, 4), 'suggestedGrid'); // Top 4
        renderFiles(data, 'fileGrid'); // All
    }
}

// --- Rendering ---
function renderFiles(files, containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = "";

    if (!files || files.length === 0) {
        container.innerHTML = "<p style='color:#888; grid-column: 1/-1;'>No files found.</p>";
        return;
    }

    files.forEach(file => {
        if(file.name === ".emptyFolderPlaceholder") return;

        const isFolder = !file.metadata; 
        
        // Icon Selection
        let icon = "article";
        let color = "#1a73e8"; // Blue default
        if(isFolder) { icon = "folder"; color = "#5f6368"; }
        else if(file.name.match(/\.(jpg|jpeg|png|gif)$/i)) { icon = "image"; color = "#d93025"; }
        else if(file.name.match(/\.pdf$/i)) { icon = "picture_as_pdf"; color = "#ea4335"; }

        const card = document.createElement('div');
        card.className = "file-card";
        
        // Double Click Action
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
                <span class="material-icons-outlined" style="margin-right:8px; color:${color}; font-size:20px;">${icon}</span>
                <span class="file-name">${file.name}</span>
                <button class="more-btn" onclick="openContextMenu(event, '${file.name}')">
                    <span class="material-icons-outlined">more_vert</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Context Menu ---
window.openContextMenu = function(event, fileName) {
    event.stopPropagation();
    closeAllMenus();

    const menu = document.createElement('div');
    menu.className = "context-menu";
    // Position near mouse
    menu.style.top = `${event.pageY}px`;
    menu.style.left = `${event.pageX - 150}px`; // Shift left slightly

    // Split extension for rename logic
    const parts = fileName.split('.');
    const ext = parts.length > 1 ? '.' + parts.pop() : ''; 
    const nameNoExt = parts.join('.');

    menu.innerHTML = `
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

window.closeAllMenus = function() {
    document.querySelectorAll('.context-menu').forEach(el => el.remove());
}

// --- Actions ---
window.createFolder = async function() {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    const path = window.currentFolder 
        ? `${window.currentUser.id}/${window.currentFolder}/${folderName}/.emptyFolderPlaceholder`
        : `${window.currentUser.id}/${folderName}/.emptyFolderPlaceholder`;

    const { error } = await supabaseClient.storage.from('files').upload(path, new Blob([""]));
    if (error) alert("Error creating folder");
    else refreshView();
}

window.openFolder = function(folderName) {
    const newPath = window.currentFolder ? `${window.currentFolder}/${folderName}` : folderName;
    loadMyDrive(newPath);
}

window.openFile = async function(fileName) {
    const path = window.currentFolder ? `${window.currentUser.id}/${window.currentFolder}/${fileName}` : `${window.currentUser.id}/${fileName}`;
    const { data } = supabaseClient.storage.from('files').getPublicUrl(path);
    if(data) window.open(data.publicUrl, '_blank');
}

window.deleteFile = async function(fileName) {
    if(!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    
    const path = window.currentFolder ? `${window.currentUser.id}/${window.currentFolder}/${fileName}` : `${window.currentUser.id}/${fileName}`;
    
    const { error } = await supabaseClient.storage.from('files').remove([path]);
    if(error) alert("Delete failed: " + error.message);
    else {
        closeAllMenus();
        refreshView();
    }
}

window.triggerRename = async function(oldNameNoExt, ext, oldFullName) {
    const newName = prompt("Rename to:", oldNameNoExt);
    if (!newName || newName === oldNameNoExt) return;

    const newFullName = newName + ext;
    const basePath = window.currentFolder ? `${window.currentUser.id}/${window.currentFolder}` : `${window.currentUser.id}`;
    
    const { error } = await supabaseClient.storage.from('files').move(`${basePath}/${oldFullName}`, `${basePath}/${newFullName}`);
    
    if(error) alert("Rename failed: " + error.message);
    else {
        closeAllMenus();
        refreshView();
    }
}

// Upload Listener
const fileInput = document.getElementById('fileInput');
if(fileInput) {
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const path = window.currentFolder 
            ? `${window.currentUser.id}/${window.currentFolder}/${file.name}` 
            : `${window.currentUser.id}/${file.name}`;
            
        const { error } = await supabaseClient.storage.from('files').upload(path, file);
        if(error) alert("Upload failed: " + error.message);
        else refreshView();
    };
}

function refreshView() {
    if(window.currentTab === 'home') loadRecentFiles();
    else loadMyDrive(window.currentFolder);
}

window.toggleProfileMenu = function() {
    const menu = document.getElementById('profileMenu');
    menu.classList.toggle('hidden');
}

window.logout = async function() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}
