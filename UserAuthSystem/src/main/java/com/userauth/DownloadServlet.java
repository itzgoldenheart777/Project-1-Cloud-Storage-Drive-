package com.userauth;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/download")
public class DownloadServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        int id = Integer.parseInt(request.getParameter("id"));
        HttpSession session = request.getSession();
        String email = (String) session.getAttribute("email");

        try {
            Connection con = DBConnection.getConnection();

            PreparedStatement ps = con.prepareStatement("SELECT * FROM files WHERE id=?");
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String path = rs.getString("file_path");
                String fileName = rs.getString("file_name");

                String fullPath = getServletContext().getRealPath("") + path;
                File file = new File(fullPath);

                // log download
                PreparedStatement log = con.prepareStatement(
                    "INSERT INTO downloads(user_email, file_id) VALUES(?,?)"
                );
                log.setString(1, email);
                log.setInt(2, id);
                log.executeUpdate();

                // send file
                response.setContentType("application/octet-stream");
                response.setHeader("Content-Disposition", "attachment;filename=\"" + fileName + "\"");

                FileInputStream in = new FileInputStream(file);
                OutputStream out = response.getOutputStream();

                byte[] buffer = new byte[4096];
                int len;
                while ((len = in.read(buffer)) != -1) {
                    out.write(buffer, 0, len);
                }

                in.close();
                out.close();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
