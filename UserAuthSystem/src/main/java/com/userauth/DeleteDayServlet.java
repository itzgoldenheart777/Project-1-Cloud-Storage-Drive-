protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    String id = req.getParameter("id");

    try{
        Connection con = DBConnection.getConnection();
        PreparedStatement ps = con.prepareStatement("DELETE FROM days WHERE id=?");
        ps.setString(1,id);
        ps.executeUpdate();
    }catch(Exception e){e.printStackTrace();}

    res.sendRedirect("dashboard.jsp");
}
