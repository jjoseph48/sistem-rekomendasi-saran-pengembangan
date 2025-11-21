document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  const errorMsg = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    errorMsg.style.display = "none";

    try {
      const response = await fetch("http://localhost:8000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Login gagal. Periksa kembali username dan password.");
      }

      // Simpan data login di localStorage
      localStorage.setItem("adminUser", JSON.stringify(result.user));

      // Redirect ke dashboard admin
      window.location.href = "dashboard-admin.html";
    } catch (error) {
      errorMsg.textContent = error.message;
      errorMsg.style.display = "block";
    }
  });
});