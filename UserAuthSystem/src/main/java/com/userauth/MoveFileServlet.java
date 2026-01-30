package com.userauth;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/moveFile")
public class MoveFileServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession s = request.getSession(false);
        if (s == null || s.getAttribute("email") == null) {
            response.sendRedirect("login.jsp");
            return;
        }

        String email = (String) s.getAttribute("email");
        int fileId = Integer.parseInt(request.getParameter("fileId"));
        String folder = request.getParameter("folder");

        try {
            Connection con = DBConnection.getConnection();

            // 1️⃣ Get file info
            PreparedStatement ps = con.prepareStatement(
                "SELECT file_name, file_path, day_folder FROM files WHERE id=? AND user_email=?"
            );
            ps.setInt(1, fileId);
            ps.setString(2, email);
            ResultSet rs = ps.executeQuery();

            if (!rs.next()) {
                response.sendRedirect("dashboard.jsp");
                return;
            }

            String fileName = rs.getString("file_name");
            String oldPath = rs.getString("file_path");   // userfiles/day1/abc.png
            String day = rs.getString("day_folder");

            // 2️⃣ Prepare new path
            String basePath = getServletContext().getRealPath("/") + "userfiles/" + day + "/";
            File oldFile = new File(getServletContext().getRealPath("/") + oldPath);

            File newFolder = new File(basePath + folder);
            if (!newFolder.exists()) newFolder.mkdirs();

            File newFile = new File(newFolder, fileName);

            // 3️⃣ Move file physically
            if (!oldFile.renameTo(newFile)) {
                throw new Exception("File move failed");
            }

            // 4️⃣ Update DB
            String newDbPath = "userfiles/" + day + "/" + folder + "/" + fileName;

            PreparedStatement ups = con.prepareStatement(
                "UPDATE files SET folder_name=?, file_path=? WHERE id=?"
            );
            ups.setString(1, folder);
            ups.setString(2, newDbPath);
            ups.setInt(3, fileId);
            ups.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }

        // 5️⃣ Go back
        response.sendRedirect("days/day1.jsp");
    }
}
