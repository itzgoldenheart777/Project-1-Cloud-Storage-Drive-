package com.userauth;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/testdb")
public class TestDBServlet extends HttpServlet {

    /**
	 * 
	 */
	private static final long serialVersionUID = -8724315892675388285L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        Connection con = DBConnection.getConnection();

        if (con != null) {
            out.println("<h2 style='color:green'>Database Connected Successfully!</h2>");
        } else {
            out.println("<h2 style='color:red'>Database Connection Failed!</h2>");
        }
    }
}
