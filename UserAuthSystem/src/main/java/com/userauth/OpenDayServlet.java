@WebServlet("/openDay")
public class OpenDayServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String id = req.getParameter("id");

        // redirect to single JSP page
        resp.sendRedirect("openDay.jsp?id=" + id);
    }
}
