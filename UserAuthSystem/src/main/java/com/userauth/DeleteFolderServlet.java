@WebServlet("/deleteFolder")
public class DeleteFolderServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String name = req.getParameter("name");

        HttpSession s = req.getSession(false);
        String email = (String)s.getAttribute("email");

        try{
            Connection con = DBConnection.getConnection();

            // delete files inside
            PreparedStatement p1 = con.prepareStatement(
              "DELETE FROM files WHERE folder_name=? AND user_email=?"
            );
            p1.setString(1, name);
            p1.setString(2, email);
            p1.executeUpdate();

            // delete folder
            PreparedStatement p2 = con.prepareStatement(
              "DELETE FROM folders WHERE folder_name=? AND user_email=?"
            );
            p2.setString(1, name);
            p2.setString(2, email);
            p2.executeUpdate();

        }catch(Exception e){e.printStackTrace();}

        res.sendRedirect(req.getHeader("Referer"));
    }
}
