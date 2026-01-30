<%@ page import="java.sql.*" %>
<%@ page import="com.userauth.DBConnection" %>
<%@ page import="javax.servlet.http.HttpSession" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%
    // ==============================
    // 🔐 SESSION CHECK
    // ==============================
    HttpSession s = request.getSession(false);
    if (s == null || s.getAttribute("email") == null) {
        response.sendRedirect("../login.jsp");
        return;
    }
    String email = (String) s.getAttribute("email");
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Day 1 Files</title>

<!-- ==============================
     🎨 CSS
     ============================== -->
<style>
body{font-family:Arial;background:#f1f3f4;padding:30px;}
.upload-card{background:white;padding:20px;border-radius:10px;max-width:500px;box-shadow:0 2px 6px rgba(0,0,0,0.1);}
.preview img{max-width:120px;margin-top:10px;display:none;border-radius:8px;}
.files-grid{margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:15px;}
.file-card{background:white;border-radius:8px;padding:10px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);}
.file-card img{width:100%;height:120px;object-fit:cover;border-radius:6px;cursor:pointer;}
.file-name{font-size:12px;margin-top:5px;word-break:break-all;}
.file-actions{margin-top:8px;display:flex;justify-content:space-between;font-size:12px;}
.file-actions a{text-decoration:none;color:#1a73e8;}
</style>

<!-- ==============================
     🧠 JS
     ============================== -->
<script>
// preview before upload
function previewFile(){
    const f=document.getElementById("file").files[0];
    const p=document.getElementById("previewImg");
    if(f && f.type.startsWith("image/")){
        const r=new FileReader();
        r.onload=e=>{p.src=e.target.result;p.style.display="block";}
        r.readAsDataURL(f);
    } else p.style.display="none";
}

// rename (lock extension)
function renameFile(id, oldName){
    let dot = oldName.lastIndexOf(".");
    let base = oldName.substring(0,dot);
    let ext = oldName.substring(dot);
    let n = prompt("Enter new file name:", base);
    if(n && n.trim()!==""){
        location.href="../renameFile?id="+id+"&name="+encodeURIComponent(n+ext);
    }
}

// preview modal
function openPreview(src){
    document.getElementById("modalImg").src=src;
    document.getElementById("previewModal").style.display="flex";
}
function closeModal(){document.getElementById("previewModal").style.display="none";}

// move modal
function openMoveModal(id){
    document.getElementById("moveFileId").value=id;
    document.getElementById("moveModal").style.display="flex";
}
function closeMoveModal(){document.getElementById("moveModal").style.display="none";}
</script>
</head>

<body>

<h2>📁 Day 1 - Upload Files</h2>
<hr>

<!-- ==============================
     📁 CREATE FOLDER
     ============================== -->
<h3>📁 Create Folder</h3>
<form action="../createFolder" method="post">
    <input type="hidden" name="day" value="day1">
    <input type="text" name="folder" placeholder="Folder name" required>
    <button type="submit">Create</button>
</form>

<hr>

<!-- ==============================
     ⬆ UPLOAD
     ============================== -->
<div class="upload-card">
<form action="../upload" method="post" enctype="multipart/form-data">
    <input type="hidden" name="day" value="day1">
    <input type="file" id="file" name="file" onchange="previewFile()" required>
    <div class="preview"><img id="previewImg"></div>
    <br>
    <button type="submit">Upload</button>
</form>
</div>

<hr>

<!-- ==============================
     📂 SHOW FOLDERS
     ============================== -->
<h3>📂 Folders</h3>
<div class="files-grid">
<%
Connection con = DBConnection.getConnection();

// folders
PreparedStatement fps = con.prepareStatement("SELECT * FROM folders WHERE user_email=? AND day_folder='day1'");
fps.setString(1,email);
ResultSet frs=fps.executeQuery();
while(frs.next()){
%>
<div class="file-card">
    <img src="../images/folder.png">
    <div class="file-name"><%= frs.getString("folder_name") %></div>
    <div class="file-actions">
        <a href="openFolder.jsp?name=<%= frs.getString("folder_name") %>">📂 Open</a>
    </div>
</div>
<% } %>
</div>

<hr>

<!-- ==============================
     📄 SHOW FILES
     ============================== -->
<h3>📄 Your Files</h3>
<div class="files-grid">
<%
PreparedStatement ps = con.prepareStatement(
"SELECT * FROM files WHERE user_email=? AND day_folder='day1' AND folder_name IS NULL ORDER BY id DESC");
ps.setString(1,email);
ResultSet rs=ps.executeQuery();
while(rs.next()){
int id=rs.getInt("id");
String name=rs.getString("file_name");
String path="../"+rs.getString("file_path");
%>

<div class="file-card">
<% if(name.toLowerCase().matches(".*(jpg|jpeg|png)$")){ %>
<img src="<%= path %>" onclick="openPreview('<%= path %>')">
<% } else { %>
<img src="../images/file.png">
<% } %>

<div class="file-name"><%= name %></div>

<div class="file-actions">
<a href="../download?id=<%= id %>">⬇ Download</a>
<a href="javascript:renameFile(<%= id %>, '<%= name %>')">✏ Rename</a>
<a href="../deleteFile?id=<%= id %>" onclick="return confirm('Delete?')">🗑 Delete</a>
<a href="javascript:openMoveModal(<%= id %>)">📁 Move</a>
</div>
</div>

<% } %>
</div>

<br>
<a href="../dashboard.jsp">⬅ Back to Dashboard</a>

<!-- ==============================
     🖼 PREVIEW MODAL
     ============================== -->
<div id="previewModal" onclick="closeModal()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);justify-content:center;align-items:center;">
<img id="modalImg" style="max-width:90%;max-height:90%;border-radius:10px;">
</div>

<!-- ==============================
     📁 MOVE MODAL (ONLY ONCE)
     ============================== -->
<div id="moveModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);justify-content:center;align-items:center;">
<div style="background:white;padding:20px;border-radius:10px;">
<h3>Move file</h3>
<form action="../moveFile" method="post">
<input type="hidden" name="fileId" id="moveFileId">
<select name="folder" required style="width:100%">
<option value="">Select folder</option>
<%
PreparedStatement mps = con.prepareStatement("SELECT * FROM folders WHERE user_email=? AND day_folder='day1'");
mps.setString(1,email);
ResultSet mrs=mps.executeQuery();
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
