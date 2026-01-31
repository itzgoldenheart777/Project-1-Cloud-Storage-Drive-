// js/auth.js

const auth = window.supabaseClient.auth;

// LOGIN
async function login(email, password) {
  try {
    const { error } = await auth.signInWithPassword({ email, password });
    if (error) throw error;

    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
}

// REGISTER
async function register(email, password) {
  try {
    const { error } = await auth.signUp({ email, password });
    if (error) throw error;

    alert("Registration successful. Please login.");
  } catch (err) {
    alert(err.message);
  }
}

// LOGOUT
async function logout() {
  await auth.signOut();
  window.location.href = "login.html";
}

// SEND RESET EMAIL
async function sendResetEmail(email) {
  if (!email) return alert("Enter email first.");

  try {
    const { error } = await auth.resetPasswordForEmail(email, {
      redirectTo:
        "https://itzgoldenheart777.github.io/Project-1-Cloud-Storage-Drive/reset.html"
    });

    if (error) throw error;

    alert("Password reset link sent.");
  } catch (err) {
    alert(err.message);
  }
}

// UPDATE PASSWORD
async function updatePassword(newPassword) {
  try {
    const { error } = await auth.updateUser({ password: newPassword });
    if (error) throw error;

    alert("Password updated successfully.");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
}

// REQUIRE LOGIN
async function requireAuth() {
  const { data } = await auth.getSession();

  if (!data.session) {
    window.location.href = "login.html";
  }
}
