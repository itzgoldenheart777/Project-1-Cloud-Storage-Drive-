<%@ page import="java.sql.*" %>
<%@ page import="com.userauth.DBConnection" %>

<%
String email = (String) session.getAttribute("email");
if (email == null) {
    response.sendRedirect("login.jsp");
    return;
}

Connection con = DBConnection.getConnection();
PreparedStatement ps = con.prepareStatement("SELECT * FROM users WHERE email=?");
ps.setString(1, email);
ResultSet rs = ps.executeQuery();

String name="", contact="", profilePic="default.png";

if(rs.next()){
    name = rs.getString("name");
    contact = rs.getString("contact");
    profilePic = rs.getString("profile_pic");
    if(profilePic == null || profilePic.equals("")) profilePic = "default.png";
}
%>

<!DOCTYPE html>
<html>
<head>
<title>My Profile</title>
<link rel="stylesheet" href="CSS/style.css">
</head>
<body>

<div class="auth-card">

    <h2>My Profile</h2>

    <img src="uploads/<%=profilePic%>" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:15px;">

    <form action="updateProfile" method="post" enctype="multipart/form-data">

        <div class="input-group">
            <input type="text" name="name" value="<%=name%>" required>
            <label>Name</label>
        </div>

        <div class="input-group">
            <input type="text" name="contact" value="<%=contact%>">
            <label>Contact</label>
        </div>

        <div class="input-group">
            <input type="password" name="password">
            <label>New Password</label>
        </div>

        <div class="input-group">
            <input type="file" name="photo">
        </div>

        <button class="btn">Update Profile</button>

    </form>

    <a class="link" href="dashboard.jsp">Back to Dashboard</a>

</div>

</body>
</html>
