protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    String id = req.getParameter("id");
    String newName = req.getParameter("new");

    try{
        Connection con = DBConnection.getConnection();
        PreparedStatement ps = con.prepareStatement(
            "UPDATE days SET day_name=? WHERE id=?"
        );
        ps.setString(1,newName);
        ps.setString(2,id);
        ps.executeUpdate();
    }catch(Exception e){e.printStackTrace();}

    res.sendRedirect("dashboard.jsp");
}
