async function forgotPassword() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://itzgoldenheart777.github.io/Project-1-Cloud-Storage-Drive/reset.html"
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Password reset link sent to your email.");
  }
}
