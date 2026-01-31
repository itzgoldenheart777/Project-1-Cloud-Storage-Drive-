let isLogin = true;

function toggleMode() {
  isLogin = !isLogin;
  document.getElementById("formTitle").innerText = isLogin ? "Login" : "Register";
}

async function handleAuth() {
  const email = email.value;
  const password = password.value;

  if (isLogin) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    window.location.href = "dashboard.html";
  } else {
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return alert(error.message);
    alert("Check your email to confirm.");
  }
}

async function resetPassword() {
  const emailVal = document.getElementById("email").value;
  await supabaseClient.auth.resetPasswordForEmail(emailVal, {
    redirectTo: window.location.origin + "/reset.html"
  });
  alert("Reset link sent.");
}

async function updatePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) return alert(error.message);
  alert("Password updated.");
  window.location.href = "login.html";
}
