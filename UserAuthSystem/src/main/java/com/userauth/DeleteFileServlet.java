package com.userauth;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/deleteFile")
public class DeleteFileServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        int id = Integer.parseInt(request.getParameter("id"));

        try {
            Connection con = DBConnection.getConnection();

            // get file path
            PreparedStatement ps = con.prepareStatement("SELECT file_path FROM files WHERE id=?");
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String path = getServletContext().getRealPath("") + rs.getString("file_path");

                // delete from disk
                File f = new File(path);
                if (f.exists()) f.delete();

                // delete from DB
                PreparedStatement ps2 = con.prepareStatement("DELETE FROM files WHERE id=?");
                ps2.setInt(1, id);
                ps2.executeUpdate();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        response.sendRedirect(request.getHeader("Referer"));
    }
}
