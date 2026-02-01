document.addEventListener("DOMContentLoaded", () => {

  // SIGN UP
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Account created! Check your email.");
        window.location.href = "login.html";
      }
    });
  }

  // LOGIN
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert(error.message);
      } else {
        window.location.href = "dashboard.html";
      }
    });
  }

  // RESET PASSWORD
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {

      const email = document.getElementById("resetEmail").value;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login.html"
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Reset email sent!");
      }
    });
  }

});
