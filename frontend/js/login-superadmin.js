document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("superadminLoginForm");
  const errorMsg = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    errorMsg.style.display = "none";

    try {
      const response = await fetch("api/superadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Login gagal. Periksa kembali username dan password.");
      }

      // Simpan data login superadmin di localStorage
      localStorage.setItem("superadminUser", JSON.stringify(result.user));

      // Arahkan ke dashboard superadmin
      window.location.href = "dashboard-superadmin.html";
    } catch (error) {
      errorMsg.textContent = error.message;
      errorMsg.style.display = "block";
    }
  });
});