function goToLogin(role) {
  if (role === "pegawai") {
    window.location.href = "login-pegawai.html";
  } else if (role === "admin") {
    window.location.href = "login-admin.html";
  }
}

// Reload otomatis hanya saat mode development (localhost)
if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
  console.log("Development mode: auto-refresh enabled");
  setTimeout(() => location.reload(), 5000); // auto-refresh setiap 5 detik
}