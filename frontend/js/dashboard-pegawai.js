document.addEventListener("DOMContentLoaded", async () => {
  const nip = localStorage.getItem("nip");

  if (!nip) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "login-pegawai.html";
    return;
  }

  const saranContainer = document.getElementById("saranContainer");
  const profilContainer = document.getElementById("profilContainer");

  saranContainer.innerHTML = "<p class='loading-text'>Memuat saran pengembangan...</p>";
  profilContainer.innerHTML = "<p class='loading-text'>Memuat profil pegawai...</p>";

  try {
    // ✅ Panggil dua endpoint secara paralel
    const [profilRes, saranRes] = await Promise.all([
      fetch(`http://localhost:8000/profile/${nip}`, { method: "GET" }),
      fetch(`http://localhost:8000/saran/${nip}`, { method: "GET" }),
    ]);

    if (!profilRes.ok) throw new Error(`Gagal memuat profil (${profilRes.status})`);
    if (!saranRes.ok) throw new Error(`Gagal memuat saran (${saranRes.status})`);

    const profil = await profilRes.json();
    const saranData = await saranRes.json();

    // 🧩 Tampilkan profil
    profilContainer.innerHTML = `
      <div class="profil-card">
        <h2>${profil.nama}</h2>
        <p><strong>NIP:</strong> ${profil.nip}</p>
        <p><strong>Satker:</strong> ${profil.satker}</p>
        <p><strong>Jabatan:</strong> ${profil.jabatan}</p>
        <p><strong>Kinerja:</strong> ${profil.kinerja}</p>
      </div>
    `;

    // 🧩 Tampilkan saran pengembangan
    saranContainer.innerHTML = ""; // kosongkan kontainer
    const saranList = saranData.riwayat_saran || [];

    if (saranList.length === 0) {
      saranContainer.innerHTML = "<p class='loading-text'>Belum ada saran pengembangan.</p>";
      return;
    }

    const first3 = saranList
      .sort((a, b) => new Date(a.tanggal_rekomendasi) - new Date(b.tanggal_rekomendasi))
      .slice(0, 3);

    first3.forEach((item, index) => {
      const card = document.createElement("div");
      card.classList.add("saran-card");
      card.style.animationDelay = `${index * 0.2}s`;

      card.innerHTML = `
        <h3>${item.kompetensi}</h3>
        <p><strong>Aspek:</strong> ${item.aspek_kompetensi}</p>
        <p>${item.saran_pengembangan}</p>
      `;

      // Klik → ke profil pegawai
      card.addEventListener("click", () => {
        window.location.href = `profil-pegawai.html?nip=${nip}`;
      });

      saranContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Gagal memuat data:", err);
    profilContainer.innerHTML = `<p class='loading-text'>Gagal memuat profil pegawai.</p>`;
    saranContainer.innerHTML = `<p class='loading-text'>Gagal memuat saran pengembangan.</p>`;
  }
});

// 🔒 Tombol Logout
document.querySelector(".c_dashboard-frame24").addEventListener("click", () => {
  if (confirm("Yakin ingin logout?")) {
    localStorage.clear();
    window.location.href = "login-pegawai.html";
  }
});