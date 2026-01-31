async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await window.supabase.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Registration successful!");
    window.location.href = "dashboard.html";
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await window.supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Login successful!");
    window.location.href = "dashboard.html";
  }
}


async function logout() {
    await window.supabaseClient.auth.signOut();
    window.location.href = "login.html";
}
