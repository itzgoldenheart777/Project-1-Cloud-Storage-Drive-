<%@ page import="java.sql.*" %>
<%@ page import="com.userauth.DBConnection" %>
<%@ page import="javax.servlet.http.HttpSession" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%
HttpSession s = request.getSession(false);
if (s == null || s.getAttribute("email") == null) {
    response.sendRedirect("../login.jsp");
    return;
}
String email = (String) s.getAttribute("email");
Connection con = DBConnection.getConnection();
%>

<!DOCTYPE html>
<html>
<head>
<title>Day 1</title>

<style>
body{font-family:Arial;background:#f1f3f4;padding:30px;}
.upload-card{background:white;padding:20px;border-radius:10px;max-width:500px;}
.files-grid{margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:15px;}
.file-card{background:white;border-radius:8px;padding:10px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);position:relative;}
.file-card img{width:100%;height:120px;object-fit:cover;border-radius:6px;cursor:pointer;}
.file-name{font-size:12px;margin-top:5px;word-break:break-all;}
.menu{
    display:none; position:absolute; right:0; top:24px;
    background:white; border:1px solid #ccc; border-radius:6px;
    box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:100; min-width:140px;
}
.menu a{display:block;padding:8px;text-decoration:none;color:black;}
.menu a:hover{background:#f1f1f1;}
</style>

<script>
// ================= FILE =================
function toggleFileMenu(id){
    document.querySelectorAll("[id^='fileMenu-']").forEach(m => m.style.display="none");
    let m = document.getElementById("fileMenu-"+id);
    m.style.display = (m.style.display==="block")?"none":"block";
}

function renameFile(id, oldName){
    let dot = oldName.lastIndexOf(".");
    let base = oldName.substring(0,dot);
    let ext = oldName.substring(dot);
    let n = prompt("New file name:", base);
    if(n && n.trim()!==""){
        location.href="../renameFile?id="+id+"&name="+encodeURIComponent(n+ext);
    }
}

function openPreview(src){
    document.getElementById("modalImg").src = src;
    document.getElementById("previewModal").style.display="flex";
}
function closeModal(){document.getElementById("previewModal").style.display="none";}

function openMoveModal(id){
    document.getElementById("moveFileId").value=id;
    document.getElementById("moveModal").style.display="flex";
}
function closeMoveModal(){document.getElementById("moveModal").style.display="none";}

// ================= FOLDER =================
function toggleFolderMenu(name){
    document.querySelectorAll("[id^='folderMenu-']").forEach(m => m.style.display="none");
    let m = document.getElementById("folderMenu-"+name);
    m.style.display = (m.style.display==="block")?"none":"block";
}

function renameFolder(oldName){
    let n = prompt("New folder name:", oldName);
    if(n && n.trim()!==""){
        location.href="../renameFolder?old="+encodeURIComponent(oldName)+"&new="+encodeURIComponent(n);
    }
}

function openFolder(name){
    location.href="openFolder.jsp?name="+encodeURIComponent(name);
}
</script>

</head>
<body>

<h2>📁 Day 1</h2>

<!-- CREATE FOLDER -->
<form action="../createFolder" method="post">
<input type="hidden" name="day" value="day1">
<input type="text" name="folder" placeholder="Folder name" required>
<button>Create Folder</button>
</form>

<br>

<!-- UPLOAD -->
<div class="upload-card">
<form action="../upload" method="post" enctype="multipart/form-data">
<input type="hidden" name="day" value="day1">
<input type="file" name="file" required>
<button>Upload File</button>
</form>
</div>

<hr>

<!-- ================= FOLDERS ================= -->
<h3>📂 Folders</h3>
<div class="files-grid">

<%
PreparedStatement fps = con.prepareStatement("SELECT * FROM folders WHERE user_email=? AND day_folder='day1'");
fps.setString(1,email);
ResultSet frs = fps.executeQuery();
while(frs.next()){
String fname = frs.getString("folder_name");
%>

<div class="file-card">

<img src="../images/folder.png" onclick="openFolder('<%= fname %>')">
<div class="file-name"><%= fname %></div>

<button onclick="toggleFolderMenu('<%= fname %>')" style="position:absolute;top:5px;right:5px;border:none;background:none;font-size:18px;">⋮</button>

<div class="menu" id="folderMenu-<%= fname %>">
    <a href="openFolder.jsp?name=<%= fname %>">📂 Open</a>
    <a href="javascript:renameFolder('<%= fname %>')">✏ Rename</a>
    <a href="../copyFolder?name=<%= fname %>">📄 Copy</a>
    <a href="../deleteFolder?name=<%= fname %>" onclick="return confirm('Delete folder?')" style="color:red;">🗑 Delete</a>
</div>

</div>

<% } %>
</div>

<hr>

<!-- ================= FILES ================= -->
<h3>📄 Your Files</h3>

<div class="files-grid">

<%
PreparedStatement ps = con.prepareStatement(
"SELECT * FROM files WHERE user_email=? AND day_folder='day1' AND folder_name IS NULL ORDER BY id DESC");
ps.setString(1,email);
ResultSet rs = ps.executeQuery();

while(rs.next()){
int id = rs.getInt("id");
String name = rs.getString("file_name");
String path = "../" + rs.getString("file_path");
%>

<div class="file-card">

<% if(name.toLowerCase().matches(".*\\.(jpg|png|jpeg)")) { %>
    <img src="<%= path %>" onclick="openPreview('<%= path %>')">
<% } else { %>
    <img src="../images/file.png">
<% } %>

<div class="file-name"><%= name %></div>

<button onclick="toggleFileMenu(<%= id %>)" style="position:absolute;top:5px;right:5px;border:none;background:none;font-size:18px;">⋮</button>

<div class="menu" id="fileMenu-<%= id %>">
    <a href="javascript:openPreview('<%= path %>')">👁 View</a>
    <a href="../download?id=<%= id %>">⬇ Download</a>
    <a href="javascript:renameFile(<%= id %>, '<%= name %>')">✏ Rename</a>
    <a href="javascript:openMoveModal(<%= id %>)">📁 Move</a>
    <a href="../copyFile?id=<%= id %>">📄 Copy</a>
    <a href="../deleteFile?id=<%= id %>" onclick="return confirm('Delete file?')" style="color:red;">🗑 Delete</a>
</div>

</div>

<% } %>

</div>

<br>
<a href="../dashboard.jsp">⬅ Back to Dashboard</a>

<!-- PREVIEW MODAL -->
<div id="previewModal" onclick="closeModal()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);justify-content:center;align-items:center;">
<img id="modalImg" style="max-width:90%;max-height:90%;">
</div>

<!-- MOVE MODAL -->
<div id="moveModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);justify-content:center;align-items:center;">
<div style="background:white;padding:20px;border-radius:10px;">
<form action="../moveFile" method="post">
<input type="hidden" name="fileId" id="moveFileId">
<select name="folder" required>
<option value="">Select folder</option>
<%
PreparedStatement mps = con.prepareStatement("SELECT * FROM folders WHERE user_email=? AND day_folder='day1'");
mps.setString(1,email);
ResultSet mrs = mps.executeQuery();
while(mrs.next()){
%>
<option value="<%= mrs.getString("folder_name") %>"><%= mrs.getString("folder_name") %></option>
<% } %>
</select>
<br><br>
<button type="submit">Move</button>
<button type="button" onclick="closeMoveModal()">Cancel</button>
</form>
</div>
</div>

</body>
</html>
