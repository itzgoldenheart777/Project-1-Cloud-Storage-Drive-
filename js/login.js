async function forgotPassword() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Enter your email first.");
    return;
  }

  const { error } = await window.supabaseClient.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: window.location.origin + "/reset.html"
    }
  );

  if (error) {
    alert(error.message);
  } else {
    alert("Password reset link sent to your email.");
  }
}
