package com.userauth;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/createFolder")
public class CreateFolderServlet extends HttpServlet {

    /**
	 * 
	 */
	private static final long serialVersionUID = -1297060469902876722L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String email = (String) session.getAttribute("email");

        String day = request.getParameter("day");
        String folder = request.getParameter("folder");

        try {
            Connection con = DBConnection.getConnection();

            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO folders(user_email, day_folder, folder_name) VALUES(?,?,?)"
            );
            ps.setString(1, email);
            ps.setString(2, day);
            ps.setString(3, folder);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }

        response.sendRedirect("days/" + day + ".jsp");
    }
}
