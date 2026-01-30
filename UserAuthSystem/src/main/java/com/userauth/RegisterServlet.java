package com.userauth;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {

    /**
	 * 
	 */
	private static final long serialVersionUID = 3535931470475376322L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

		String name = request.getParameter("name");
		String email = request.getParameter("email");
		String contact = request.getParameter("contact");
		String password = request.getParameter("password");
		
        try {
            Connection con = DBConnection.getConnection();

            String sql = "INSERT INTO users(name, email, contact, password) VALUES (?, ?, ?, ?)";
            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, contact);
            ps.setString(4, password);

            int i = ps.executeUpdate();

            if (i > 0) {
                response.sendRedirect("login.jsp");
            } else {
                response.getWriter().println("<h2 style='color:red'>Registration Failed!</h2>");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("<h2 style='color:red'>Error: " + e.getMessage() + "</h2>");
        }
    }
}
