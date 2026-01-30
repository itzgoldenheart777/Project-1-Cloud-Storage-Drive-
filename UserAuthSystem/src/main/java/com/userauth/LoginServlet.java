package com.userauth;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.servlet.http.HttpSession;


import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    /**
	 * 
	 */
	private static final long serialVersionUID = -2895689938693181347L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String email = request.getParameter("email");
        String password = request.getParameter("password");

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        try {
            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM users WHERE email=? AND password=?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, email);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                HttpSession session = request.getSession();
                session.setAttribute("username", rs.getString("name"));
                session.setAttribute("email", rs.getString("email"));
                session.setAttribute("profilePic", rs.getString("profile_pic"));
                response.sendRedirect("dashboard.jsp");

            } else {
                out.println("<h2 style='color:red'>Invalid Email or Password</h2>");
                out.println("<a href='login.jsp'>Try Again</a>");
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.println("<h2 style='color:red'>Error: " + e.getMessage() + "</h2>");
        }
    }
}
