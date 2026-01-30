package com.userauth;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.annotation.*;
import javax.servlet.http.*;

@WebServlet("/updateProfile")
@MultipartConfig
public class UpdateProfileServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {

        HttpSession session = request.getSession();
        String email = (String) session.getAttribute("email");

        String name = request.getParameter("name");
        String contact = request.getParameter("contact");
        String password = request.getParameter("password");

        Part file = request.getPart("photo");
        String fileName = file.getSubmittedFileName();

        String uploadPath = getServletContext().getRealPath("") + "uploads";

        if(fileName != null && !fileName.equals("")){
            File dir = new File(uploadPath);
            if(!dir.exists()) dir.mkdir();

            file.write(uploadPath + File.separator + fileName);
        }

        try {
            Connection con = DBConnection.getConnection();

            String sql;

            if(password != null && !password.equals("") && fileName != null && !fileName.equals("")){
                sql = "UPDATE users SET name=?, contact=?, password=?, profile_pic=? WHERE email=?";
            }
            else if(password != null && !password.equals("")){
                sql = "UPDATE users SET name=?, contact=?, password=? WHERE email=?";
            }
            else if(fileName != null && !fileName.equals("")){
                sql = "UPDATE users SET name=?, contact=?, profile_pic=? WHERE email=?";
            }
            else{
                sql = "UPDATE users SET name=?, contact=? WHERE email=?";
            }

            PreparedStatement ps = con.prepareStatement(sql);

            if(sql.contains("password") && sql.contains("profile_pic")){
                ps.setString(1, name);
                ps.setString(2, contact);
                ps.setString(3, password);
                ps.setString(4, fileName);
                ps.setString(5, email);
            }
            else if(sql.contains("password")){
                ps.setString(1, name);
                ps.setString(2, contact);
                ps.setString(3, password);
                ps.setString(4, email);
            }
            else if(sql.contains("profile_pic")){
                ps.setString(1, name);
                ps.setString(2, contact);
                ps.setString(3, fileName);
                ps.setString(4, email);
            }
            else{
                ps.setString(1, name);
                ps.setString(2, contact);
                ps.setString(3, email);
            }

            ps.executeUpdate();

            session.setAttribute("username", name);
            session.setAttribute("profilePic", fileName);
            
            response.sendRedirect("dashboard.jsp");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
