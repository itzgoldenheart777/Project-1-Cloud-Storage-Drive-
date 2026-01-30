package com.userauth;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/renameFile")
public class RenameFileServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        int id = Integer.parseInt(request.getParameter("id"));
        String newName = request.getParameter("name");

        try {
            Connection con = DBConnection.getConnection();

            // Get old file path
            PreparedStatement ps = con.prepareStatement("SELECT file_path FROM files WHERE id=?");
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if(rs.next()){
                String oldPath = getServletContext().getRealPath("/") + rs.getString("file_path");
                File oldFile = new File(oldPath);

                String newPath = oldFile.getParent() + File.separator + newName;
                File newFile = new File(newPath);

                if(oldFile.renameTo(newFile)){
                    PreparedStatement ups = con.prepareStatement(
                        "UPDATE files SET file_name=?, file_path=? WHERE id=?"
                    );
                    ups.setString(1, newName);
                    ups.setString(2, "userfiles/day1/" + newName);
                    ups.setInt(3, id);
                    ups.executeUpdate();
                }
            }

        } catch(Exception e){
            e.printStackTrace();
        }

        response.sendRedirect("days/day1.jsp");
    }
}
