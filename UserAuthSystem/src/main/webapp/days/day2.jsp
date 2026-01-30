<%@ page language="java" contentType="text/html; charset=UTF-8" %>
<%
    if(session.getAttribute("username") == null){
        response.sendRedirect("../login.jsp");
        return;
    }
%>

<!DOCTYPE html>
<html>
<head>
  <title>Day 1 - CSS Display and Position</title>
  <style>
    body{
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }

    h1,h2{
      color: #333;
    }

    .section{
      background-color: white;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
    }

    .box{
      background-color: #4caf50;
      color: white;
      padding: 10px;
      margin: 5px;
    }

    .inline{ display: inline; }
    .inline-block{
      display: inline-block;
      width: 120px;
      height: 50px;
    }
    .block{ display: block; }
    .none{ display: none; }

    .flex{
      display: flex;
      gap: 10px;
    }

    .grid{
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 10px;
    }

    .position-area{
      height: 250px;
      border: 2px solid black;
      position: relative;
    }

    .static{ position: static; }

    .relative{
      position: relative;
      top: 20px;
      left: 20px;
      background-color: blue;
    }

    .absolute{
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: red;
    }

    .fixed{
      position: fixed;
      bottom: 10px;
      right: 10px;
      background-color: black;
    }

    .sticky{
      position: sticky;
      top: 0;
      background-color: purple;
    }

    .inl{
      display: inline-block;
      border: 2px solid black;
      height: 120px;
      width: 400px;
      padding: 10px;
      background: white;
    }

    .back{
      display: inline-block;
      margin-bottom: 20px;
      text-decoration: none;
      color: blue;
      font-weight: bold;
    }
  </style>
</head>

<body>

<a class="back" href="../dashboard.jsp">⬅ Back to Dashboard</a>

<div class="inl">
  This is an example of inline-block box.  
  Lorem ipsum dolor sit amet consectetur adipisicing elit.
</div>

<h1>Day 1 — CSS Display and Position Properties</h1>

<div class="section">
  <h2>CSS Display Property</h2>

  <p>display: block</p>
  <div class="box block">Block 1</div>
  <div class="box block">Block 2</div>

  <p>display: inline</p>
  <span class="box inline">Inline 1</span>
  <span class="box inline">Inline 2</span>

  <p>display: inline-block</p>
  <span class="box inline-block">Inline Block 1</span>
  <span class="box inline-block">Inline Block 2</span>

  <p>display: none</p>
  <div class="box none">This is hidden</div>

  <p>display: flex</p>
  <div class="flex">
    <div class="box">Flex 1</div>
    <div class="box">Flex 2</div>
    <div class="box">Flex 3</div>
  </div>

  <p>display: grid</p>
  <div class="grid">
    <div class="box">Grid 1</div>
    <div class="box">Grid 2</div>
    <div class="box">Grid 3</div>
    <div class="box">Grid 4</div>
    <div class="box">Grid 5</div>
    <div class="box">Grid 6</div>
  </div>
</div>

<div class="section">
  <h2>CSS Position Property</h2>

  <div class="position-area">

    <p>position: static</p>
    <div class="box static">Static</div>

    <p>position: relative</p>
    <div class="box relative">Relative</div>

    <p>position: absolute</p>
    <div class="box absolute">Absolute</div>

    <p>position: sticky</p>
    <div class="box sticky">Sticky</div>

  </div>

  <p>position: fixed</p>
  <div class="box fixed">Fixed</div>

</div>

</body>
</html>
