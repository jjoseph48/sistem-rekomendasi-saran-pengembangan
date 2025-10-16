const API_BASE = "http://localhost:8000"; // ganti dengan URL backend Azure kamu

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btnLogin");

  btnLogin.addEventListener("click", async () => {
    const nip = document.getElementById("nip").value.trim();

    if (!nip) {
      alert("Masukkan NIP terlebih dahulu!");
      return;
    }

    try {
      // panggil endpoint login
      const res = await fetch(`${API_BASE}/login?nip=${nip}`, {
        method: "POST",
      });

      if (res.status === 404) {
        alert("NIP tidak ditemukan. Silakan registrasi terlebih dahulu.");
        window.location.href = "register-pegawai.html";
        return;
      }

      if (!res.ok) {
        throw new Error(`Gagal login (${res.status})`);
      }

      const data = await res.json();

      // simpan data pegawai di localStorage untuk digunakan di dashboard
      localStorage.setItem("pegawai_nip", data.nip);
      localStorage.setItem("pegawai_nama", data.nama);
      localStorage.setItem("pegawai_satker", data.satker || "");
      localStorage.setItem("pegawai_jabatan", data.jabatan || "");

      alert(`Selamat datang, ${data.nama}`);
      window.location.href = "dashboard-pegawai.html";
    } catch (err) {
      console.error("Error login:", err);
      alert("Terjadi kesalahan saat login. Coba lagi.");
    }
  });
});