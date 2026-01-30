<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.sql.*" %>
<%@ page import="javax.servlet.http.HttpSession" %>
<%@ page import="com.userauth.DBConnection" %>

<%
/* ================================
   🔐 SESSION CHECK
   ================================ */
HttpSession s = request.getSession(false);
if (s == null || s.getAttribute("email") == null) {
    response.sendRedirect("login.jsp");
    return;
}

String email = (String) s.getAttribute("email");

/* ================================
   📥 GET DAY ID FROM URL
   ================================ */
String dayIdStr = request.getParameter("id");
if (dayIdStr == null) {
    response.sendRedirect("dashboard.jsp");
    return;
}

int dayId = Integer.parseInt(dayIdStr);

/* ================================
   🔌 DB CONNECTION
   ================================ */
Connection con = DBConnection.getConnection();

/* ================================
   📁 FETCH DAY INFO
   ================================ */
PreparedStatement dps = con.prepareStatement(
    "SELECT * FROM days WHERE id=? AND user_email=?"
);
dps.setInt(1, dayId);
dps.setString(2, email);

ResultSet drs = dps.executeQuery();

if (!drs.next()) {
    out.println("Invalid Day");
    return;
}

String dayName = drs.getString("day_name");
%>

<!DOCTYPE html>
<html>
<head>
<title><%= dayName %></title>

<style>
body{font-family:Arial;background:#f1f3f4;padding:30px;}
.files-grid{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
    gap:15px;
}
.card{
    background:white;
    padding:12px;
    border-radius:8px;
    text-align:center;
    border:1px solid #ddd;
    position:relative;
}
.card img{
    width:100%;
    height:120px;
    object-fit:cover;
    border-radius:6px;
}
.menu{
    display:none;
    position:absolute;
    right:8px;
    top:30px;
    background:white;
    border:1px solid #ccc;
    border-radius:6px;
    min-width:140px;
}
.menu a{
    display:block;
    padding:8px;
    text-decoration:none;
    color:black;
}
.menu a:hover{background:#f1f1f1;}
</style>

<script>
function toggleMenu(id){
    document.querySelectorAll(".menu").forEach(m=>m.style.display="none");
    let m = document.getElementById("menu-"+id);
    if(m) m.style.display = "block";
}
</script>

</head>
<body>

<h2>📁 <%= dayName %></h2>
<a href="dashboard.jsp">⬅ Back to Dashboard</a>

<hr>

<h3>📄 Files</h3>

<div class="files-grid">

<%
PreparedStatement fps = con.prepareStatement(
    "SELECT * FROM files WHERE user_email=? AND day_id=? AND folder_name IS NULL"
);
fps.setString(1, email);
fps.setInt(2, dayId);

ResultSet frs = fps.executeQuery();

while(frs.next()){
int fid = frs.getInt("id");
String fname = frs.getString("file_name");
String fpath = frs.getString("file_path");
%>

<div class="card">
    <img src="<%= fpath %>">
    <small><%= fname %></small>

    <button onclick="toggleMenu(<%=fid%>)"
        style="position:absolute;top:5px;right:5px;">⋮</button>

    <div class="menu" id="menu-<%=fid%>">
        <a href="download?id=<%=fid%>">⬇ Download</a>
        <a href="deleteFile?id=<%=fid%>">🗑 Delete</a>
    </div>
</div>

<% } %>

</div>

</body>
</html>
