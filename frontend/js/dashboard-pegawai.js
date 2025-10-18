document.addEventListener("DOMContentLoaded", async () => {
  // === Ambil data login dari sessionStorage ===
  const nip = sessionStorage.getItem("nip");
  const nama = sessionStorage.getItem("nama");

  // 🔹 Validasi sesi login
  if (!nip) {
    alert("Sesi login Anda telah berakhir. Silakan login kembali.");
    window.location.href = "login-pegawai.html";
    return;
  }

  console.log("🔹 NIP Pegawai:", nip);

  // === Tombol Logout ===
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // === Tampilkan nama pegawai di dashboard (opsional) ===
  const namaElement = document.getElementById("namaPegawai");
  if (namaElement && nama) namaElement.textContent = nama;

  // === Ambil data saran pengembangan dari API ===
  try {
    const response = await fetch(`http://localhost:8000/pegawai/saran/${nip}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`Gagal memuat data (${response.status})`);

    const data = await response.json();
    console.log("✅ Data saran:", data);

    const container = document.getElementById("saranContainer");
    if (!container) {
      console.error("❌ Elemen #saranContainer tidak ditemukan!");
      return;
    }

    container.innerHTML = "";

    const daftarSaran = data.riwayat_saran || [];

    // 🔹 Jika tidak ada saran
    if (daftarSaran.length === 0) {
      container.innerHTML = "<p>Tidak ada saran pengembangan ditemukan.</p>";
      return;
    }

    // === Ambil 3 saran terbaru berdasarkan tanggal_rekomendasi ===
    const tigaSaranTerbaru = daftarSaran
      .sort(
        (a, b) =>
          new Date(b.tanggal_rekomendasi) - new Date(a.tanggal_rekomendasi)
      )
      .slice(0, 3);

    // === Render setiap kartu saran ===
    tigaSaranTerbaru.forEach((saran) => {
      const card = document.createElement("div");
      card.classList.add("saran-card");

      const tanggal = new Date(saran.tanggal_rekomendasi).toLocaleDateString(
        "id-ID",
        { day: "2-digit", month: "long", year: "numeric" }
      );

      card.innerHTML = `
        <h3>${saran.kompetensi}</h3>
        <p><strong>Aspek:</strong> ${saran.aspek_kompetensi}</p>
        <p><strong>Saran:</strong> ${saran.saran_pengembangan}</p>
        <p><strong>Tanggal:</strong> ${tanggal}</p>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat mengambil data:", err);
    const container = document.getElementById("saranContainer");
    if (container) {
      container.innerHTML =
        "<p style='color:red;'>Terjadi kesalahan saat memuat data saran.</p>";
    }
  }
});

// === Fungsi Logout ===
function logout() {
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "login-pegawai.html";
}