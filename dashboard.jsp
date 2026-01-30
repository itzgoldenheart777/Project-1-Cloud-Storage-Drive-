<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>  
<%@ page import="javax.servlet.http.HttpSession" %>
<%@ page import="java.sql.*" %>
<%@ page import="com.userauth.DBConnection" %>

<%
/* ================================
   🔐 SESSION SECURITY CHECK
   ================================ */
		// Checks if user is logged in
		   HttpSession s = request.getSession(false);
		   if (s == null || s.getAttribute("email") == null) {
		       response.sendRedirect("login.jsp");
		       return;
		   }
	
		   String day = request.getParameter("day");  // day1, day2, etc

/* ================================
   👤 GET USER DATA FROM SESSION
   ================================ */
String username = (String) s.getAttribute("username");
String email = (String) s.getAttribute("email");
String profilePic = (String) s.getAttribute("profilePic");
if (profilePic == null || profilePic.trim().equals("")) profilePic = "default.png";

/* ================================
   🔌 DB CONNECTION
   ================================ */
Connection con = DBConnection.getConnection();

/* ================================
   📦 STORAGE CALCULATION
   ================================ */
	// Calculate total used storage
		   PreparedStatement sps = con.prepareStatement(
		       "SELECT IFNULL(SUM(file_size),0) FROM files WHERE user_email=?"
		   );

sps.setString(1,email);
ResultSet srs = sps.executeQuery();

long used = 0;
if(srs.next()) used = srs.getLong(1);

long total = 1024L * 1024L * 1024L; // 1GB LIMIT
int percent = (int)((used * 100) / total);
%>

<!DOCTYPE html>
<html>
<head>
<title>Dashboard</title>

<!-- ================================
     🎨 STYLING
     ================================ -->
<style>
body{margin:0;font-family:Arial;background:#f1f3f4;}
.header{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:white;border-bottom:1px solid #ddd;}
.container{padding:30px;}

.days-grid, .recent-grid{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
    gap:15px;
}

.card{
    background:white;
    padding:15px;
    border-radius:8px;
    text-align:center;
    border:1px solid #ddd;
    position:relative;
}

.card img{width:60px;}

.menu{
    display:none;
    position:absolute;
    right:10px;
    top:30px;
    background:white;
    border:1px solid #ccc;
    border-radius:6px;
    box-shadow:0 2px 6px rgba(0,0,0,0.2);
    min-width:140px;
    z-index:100;
}
.menu a{display:block;padding:8px;text-decoration:none;color:black;}
.menu a:hover{background:#f1f1f1;}
</style>

<!-- ================================
     🧠 JAVASCRIPT
     ================================ -->
<script>
/* Toggle 3-dot menu */
function toggleMenu(id){
    document.querySelectorAll(".menu").forEach(m=>m.style.display="none");
    let m = document.getElementById("menu-"+id);
    if(m) m.style.display = "block";
}
PreparedStatement rps = con.prepareStatement(
		  "SELECT files.id, files.file_name, files.day_id, days.day_name " +
		  "FROM files " +
		  "LEFT JOIN days ON files.day_id = days.id " +
		  "WHERE files.user_email=? " +
		  "ORDER BY files.id DESC LIMIT 6"
		);

</script>

</head>
<body>

<!-- ================================
     🧭 HEADER
     ================================ -->
<div class="header">
    <div>📁 UserDrive</div>
    <div>
        <!-- Clickable profile -->
        <a href="profile.jsp" style="text-decoration:none;color:black;">
            <img src="uploads/<%= profilePic %>" style="width:35px;border-radius:50%;vertical-align:middle;">
            <%= username %>
        </a>
        &nbsp;
        <a href="logout">Logout</a>
    </div>
</div>



<div class="container">

<!-- ================================
     👋 WELCOME
     ================================ -->
<h2>Welcome, <%= username %> 👋</h2>

<!-- ================================
     📦 STORAGE BAR
     ================================ -->
<h3>📦 Storage</h3>

<div style="width:350px;">
    <!-- Bar background -->
    <div style="
        width:100%;
        height:22px;
        background:#e0e0e0;
        border-radius:20px;
        overflow:hidden;
        border:1px solid #ccc;
    ">
        <!-- Filled part -->
        <div style="
            width:<%= percent %>%;
            height:100%;
            background:linear-gradient(90deg, #1a73e8, #4facfe);
            text-align:center;
            color:white;
            font-size:12px;
            line-height:22px;
            transition:width 0.5s;
        ">
            <%= percent %>%
        </div>
    </div>

    <!-- Text info -->
    <div style="font-size:12px;margin-top:6px;color:#555;">
        Used: <b><%= (used / (1024*1024)) %> MB</b> of <b>1 GB</b>
    </div>
</div>


<!-- ================================
     🕒 RECENT FILES
     ================================ -->
<h3>🕒 Recent Files</h3>

<div class="recent-grid">
<%
PreparedStatement rps = con.prepareStatement(
    "SELECT * FROM files WHERE user_email=? ORDER BY id DESC LIMIT 6"
);
rps.setString(1,email);
ResultSet rrs = rps.executeQuery();

while(rrs.next()){
int fid = rrs.getInt("id");
String fname = rrs.getString("file_name");
int dayId = rrs.getInt("day_id");
%>

<div class="card">
    <img src="images/file.png"><br>
    <small><%= fname %></small>

    <!-- 3 DOT MENU -->
    <button onclick="toggleMenu('f<%=fid%>')" style="position:absolute;top:5px;right:5px;">⋮</button>

    <div class="menu" id="menu-f<%=fid%>">
    <a href="openDay?id=<%= dayId %>">📂 Open location</a>
    <a href="download?id=<%=fid%>">⬇ Download</a>
    <a href="deleteFile?id=<%=fid%>">🗑 Delete</a>
</div>


</div>

<% } %>
</div>

<hr>

<!-- ================================
     ➕ CREATE DAY
     ================================ -->
<h3>➕ Create Day</h3>
<form action="createDay" method="post">
    <input type="text" name="dayname" placeholder="Example: Day 6" required>
    <button>Create</button>
</form>

<hr>

<!-- ================================
     📁 YOUR DAYS
     ================================ -->
<h3>📁 Your Days</h3>

<div class="days-grid">

<%
PreparedStatement dps = con.prepareStatement(
    "SELECT * FROM days WHERE user_email=? ORDER BY id ASC"
);
dps.setString(1,email);
ResultSet drs = dps.executeQuery();

while(drs.next()){
int did = drs.getInt("id");
String dname = drs.getString("day_name");
%>

<div class="card">
    <img src="images/folder.png"><br>
    <b><%= dname %></b>

    <!-- 3 DOT MENU -->
    <button onclick="toggleMenu('d<%=did%>')" style="position:absolute;top:5px;right:5px;">⋮</button>

    <div class="menu" id="menu-d<%=did%>">
    
    <a href="openDay?id=<%= did %>">📂 Open</a>
    <a href="renameDay?id=<%=did%>">✏ Rename</a>
    <a href="deleteDay?id=<%=did%>">🗑 Delete</a>
</div>

</div>

<% } %>

</div>

</div>

</body>
</html>
