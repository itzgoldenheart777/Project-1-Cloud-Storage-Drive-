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

document.addEventListener("DOMContentLoaded", () => {

  const root = document.documentElement;
  const eye = document.getElementById('eyeball');
  const beam = document.getElementById('beam');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');

  // Beam animation
  root.addEventListener('mousemove', (e) => {
    let rect = beam.getBoundingClientRect();
    let mouseX = rect.right + (rect.width / 2);
    let mouseY = rect.top + (rect.height / 2);
    let rad = Math.atan2(mouseX - e.pageX, mouseY - e.pageY);
    let degrees = (rad * (20 / Math.PI) * -1) - 350;
    root.style.setProperty('--beamDegrees', `${degrees}deg`);
  });

  eye.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.toggle('show-password');
    passwordInput.type =
      passwordInput.type === 'password' ? 'text' : 'password';
  });

  // Supabase Login
  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = passwordInput.value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "dashboard.html";
    }

  });

});
