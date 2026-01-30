<!DOCTYPE html>
<html>
<head>
<title>Register</title>

<style>
body{
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f1f3f4;
    font-family: Arial, sans-serif;
}

/* ===== Register Box ===== */
.register-box{
    background: white;
    width: 100%;
    max-width: 400px;
    padding: 35px;
    border: 1px solid #dadce0;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    text-align: center;
}

.register-box h2{
    margin-bottom: 25px;
    font-weight: normal;
}

/* ===== Input Group ===== */
.input-group{
    margin-bottom: 20px;
    text-align: left;
}

.input-group label{
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
    color: #555;
}

.input-group input{
    width: 100%;
    padding: 10px;
    font-size: 15px;
    border-radius: 4px;
    border: 1px solid #ccc;
    outline: none;
}

.input-group input:focus{
    border: 2px solid #1a73e8;
}

/* ===== Button ===== */
.btn{
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 24px;
    background: #1a73e8;
    color: white;
    font-size: 16px;
    cursor: pointer;
}

.btn:hover{
    background: #1669c1;
}

/* ===== Link ===== */
.link{
    margin-top: 15px;
    display: block;
    text-decoration: none;
    color: #1a73e8;
    font-size: 14px;
}

/* ===== Mobile ===== */
@media(max-width: 480px){
    .register-box{
        margin: 20px;
    }
}
</style>
</head>

<body>

<div class="register-box">

    <h2>Create Account</h2>

    <form action="register" method="post">

        <div class="input-group">
            <label>Full Name</label>
            <input type="text" name="name" required>
        </div>

        <div class="input-group">
            <label>Email</label>
            <input type="text" name="email" required>
        </div>

        <div class="input-group">
            <label>Contact</label>
            <input type="text" name="contact" required>
        </div>

        <div class="input-group">
            <label>Password</label>
            <input type="password" name="password" required>
        </div>

        <button class="btn">Register</button>

    </form>

    <a class="link" href="login.jsp">Already have an account? Login</a>

</div>

</body>
</html>
