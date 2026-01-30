@WebServlet("/createDay")
public class CreateDayServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession s = request.getSession(false);
        String email = (String) s.getAttribute("email");
        String dayname = request.getParameter("dayname");

        try {
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO days(user_email, day_name) VALUES(?,?)"
            );
            ps.setString(1, email);
            ps.setString(2, dayname);
            ps.executeUpdate();
        } catch(Exception e){ e.printStackTrace(); }

        response.sendRedirect("dashboard.jsp");
    }
}
