async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  document.getElementById("message").innerText =
    error ? error.message : "Signup successful! You can login.";
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    document.getElementById("message").innerText = error.message;
  } else {
    window.location.href = "dashboard.html";
  }
}
