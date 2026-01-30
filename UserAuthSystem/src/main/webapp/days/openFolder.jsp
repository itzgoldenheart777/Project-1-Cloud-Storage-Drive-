<%@ page import="java.sql.*" %>
<%@ page import="com.userauth.DBConnection" %>
<%@ page import="javax.servlet.http.HttpSession" %>

<%
HttpSession s = request.getSession(false);
if (s == null || s.getAttribute("email") == null) {
    response.sendRedirect("../login.jsp");
    return;
}

String email = (String)s.getAttribute("email");
String folder = request.getParameter("name");
String day = request.getParameter("day");

Connection con = DBConnection.getConnection();
%>

<!DOCTYPE html>
<html>
<head>
<title>Folder: <%= folder %></title>
<style>
body{font-family:Arial;background:#f1f3f4;padding:30px;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:15px;}
.card{background:white;padding:10px;border-radius:8px;text-align:center;position:relative;}
.card img{width:100%;height:120px;object-fit:cover;}
.menu{display:none;position:absolute;right:10px;top:30px;background:white;border:1px solid #ccc;border-radius:6px;}
.menu a{display:block;padding:8px;text-decoration:none;color:black;}
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

<h2>📁 Folder: <%= folder %></h2>

<div class="grid">

<%
PreparedStatement ps = con.prepareStatement(
    "SELECT * FROM files WHERE user_email=? AND day_folder=? AND folder_name=?"
);
ps.setString(1,email);
ps.setString(2,day);
ps.setString(3,folder);

ResultSet rs = ps.executeQuery();

while(rs.next()){
int id = rs.getInt("id");
String name = rs.getString("file_name");
String path = "../" + rs.getString("file_path");
%>

<div class="card">
    <img src="<%= path %>">
    <div><%= name %></div>

    <button onclick="toggleMenu(<%=id%>)">⋮</button>
    <div class="menu" id="menu-<%=id%>">
        <a href="../download?id=<%=id%>">⬇ Download</a>
        <a href="../deleteFile?id=<%=id%>">🗑 Delete</a>
    </div>
</div>

<% } %>

</div>

<br>
<a href="day1.jsp">⬅ Back</a>

</body>
</html>
