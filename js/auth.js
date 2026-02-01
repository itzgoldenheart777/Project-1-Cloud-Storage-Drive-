async function login() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value;
  const password = passwordInput.value;

  const { error } = await window.supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "dashboard.html";
  }
}

async function register() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value;
  const password = passwordInput.value;

  const { error } = await window.supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Registration successful. Please login.");
  }
}

async function forgotPassword() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Enter your email first.");
    return;
  }

  const { error } =
    await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo:
        "https://itzgoldenheart777.github.io/Project-1-Cloud-Storage-Drive/reset.html"
    });

  if (error) {
    alert(error.message);
  } else {
    alert("Password reset link sent.");
  }
}
