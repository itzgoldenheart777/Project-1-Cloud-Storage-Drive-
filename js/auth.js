async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert(error.message);
    } else {
        window.location.href = "dashboard.html";
    }
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
        alert(error.message);
    } else {
        alert("Registered successfully! Please login.");
    }
}
