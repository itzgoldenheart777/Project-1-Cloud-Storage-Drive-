@WebServlet("/renameFolder")
public class RenameFolderServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String old = req.getParameter("old");
        String ne = req.getParameter("new");

        HttpSession s = req.getSession(false);
        String email = (String)s.getAttribute("email");

        try{
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(
              "UPDATE folders SET folder_name=? WHERE folder_name=? AND user_email=?"
            );
            ps.setString(1, ne);
            ps.setString(2, old);
            ps.setString(3, email);
            ps.executeUpdate();
        }catch(Exception e){e.printStackTrace();}

        res.sendRedirect(req.getHeader("Referer"));
    }
}
