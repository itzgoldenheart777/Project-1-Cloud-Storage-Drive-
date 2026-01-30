package com.userauth;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

@WebServlet("/upload")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2,  // 2MB
    maxFileSize = 1024 * 1024 * 50,       // 50MB
    maxRequestSize = 1024 * 1024 * 100    // 100MB
)
public class UploadServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("email") == null) {
            response.sendRedirect("login.jsp");
            return;
        }

        String email = (String) session.getAttribute("email");
        String day = request.getParameter("day"); // day1, day2...

        Part filePart = request.getPart("file");
        String fileName = System.currentTimeMillis() + "_" + filePart.getSubmittedFileName();

        // REAL PATH
        String uploadPath = getServletContext().getRealPath("/") + "userfiles" + File.separator + day;

        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fullPath = uploadPath + File.separator + fileName;

        // SAVE FILE
        filePart.write(fullPath);

        // SAVE TO DB
        try {
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO files(user_email, day_folder, file_name, file_path) VALUES(?,?,?,?)"
            );

            ps.setString(1, email);
            ps.setString(2, day);
            ps.setString(3, fileName);
            ps.setString(4, "userfiles/" + day + "/" + fileName);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }

        response.sendRedirect("days/" + day + ".jsp");
    }
}
