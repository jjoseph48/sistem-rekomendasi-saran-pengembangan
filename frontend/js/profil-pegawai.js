document.addEventListener("DOMContentLoaded", async () => {
  // === Ambil NIP dari sessionStorage atau query parameter ===
  const nip =
    new URLSearchParams(window.location.search).get("nip") ||
    sessionStorage.getItem("nip");

  console.log("NIP Pegawai:", nip);

  if (!nip) {
    alert("Sesi login telah berakhir. Silakan login kembali.");
    window.location.href = "login-pegawai.html";
    return;
  }

  const profilUrl = `http://localhost:8000/pegawai/profile/${nip}`;
  const saranUrl = `http://localhost:8000/pegawai/saran/${nip}`;

  let semuaSaran = [];
  let saranDipilih = null;

  // === Ambil Profil Pegawai ===
  try {
    const resProfil = await fetch(profilUrl);
    if (!resProfil.ok) throw new Error("Gagal mengambil profil");
    const profil = await resProfil.json();

    document.getElementById("nip").textContent = profil.nip || "-";
    document.getElementById("nama").textContent = profil.nama || "-";
    document.getElementById("jabatan").textContent = profil.jabatan || "-";
    document.getElementById("satker").textContent = profil.satker || "-";
    document.getElementById("kinerja").textContent = profil.kinerja || "-";
  } catch (err) {
    console.error("❌ Gagal memuat profil:", err);
  }

  // === Ambil Data Saran ===
  try {
    const resSaran = await fetch(saranUrl);
    if (!resSaran.ok) throw new Error("Gagal mengambil data saran");
    const dataSaran = await resSaran.json();

    semuaSaran = dataSaran.riwayat_saran || [];
    const tbody = document.querySelector("#tabelSaran tbody");
    tbody.innerHTML = "";

    if (semuaSaran.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Belum ada saran pengembangan.</td></tr>";
      return;
    }

    // Urutkan kompetensi agar rapi
    const urutanKompetensi = [
      "Integritas",
      "Kerjasama",
      "Komunikasi",
      "Mengelola Perubahan",
      "Orientasi pada Hasil",
      "Pelayanan Publik",
      "Pengambilan Keputusan",
      "Pengembangan Diri dan Orang Lain",
      "Perekat Bangsa",
    ];

    semuaSaran.sort((a, b) => {
      const indexA = urutanKompetensi.indexOf(a.kompetensi);
      const indexB = urutanKompetensi.indexOf(b.kompetensi);
      return indexA - indexB;
    });

    // Render tabel saran
    semuaSaran.forEach((item, index) => {
      const saranId = item.id || item.saran_id;
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.kompetensi}</td>
        <td>${item.aspek_kompetensi}</td>
        <td>${item.saran_pengembangan}</td>
        <td><button class="btn-pilih" data-id="${saranId}">Pilih</button></td>
      `;

      tbody.appendChild(tr);
    });

    // Tambahkan event listener untuk tombol pilih
    document.querySelectorAll(".btn-pilih").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const saranId = parseInt(e.target.dataset.id);
        bukaModal(saranId);
      });
    });
  } catch (err) {
    console.error("❌ Gagal memuat saran:", err);
  }

  // === Fungsi Modal ===
  function bukaModal(saranId) {
    saranDipilih = semuaSaran.find(
      (s) => s.id === saranId || s.saran_id === saranId
    );

    if (!saranDipilih) {
      alert("Saran tidak ditemukan!");
      console.error("Saran ID tidak ditemukan:", saranId);
      return;
    }

    document.getElementById("modalText").textContent = `"${saranDipilih.saran_pengembangan}" (${saranDipilih.aspek_kompetensi})`;
    document.getElementById("modalSaran").style.display = "flex";
  }

  function tutupModal() {
    document.getElementById("modalSaran").style.display = "none";
    saranDipilih = null;
  }

  // === Simpan Pilihan Saran ===
  document.getElementById("btnSimpan").addEventListener("click", async () => {
    if (!saranDipilih || (!saranDipilih.id && !saranDipilih.saran_id)) {
      alert("Saran belum dipilih dengan benar!");
      return;
    }

    try {
      const saranId = saranDipilih.id || saranDipilih.saran_id;
      const url = `http://localhost:8000/pegawai/saran/select/${saranId}`;

      const res = await fetch(url, { method: "PUT" });
      if (!res.ok) throw new Error("Gagal menyimpan saran");

      const hasil = await res.json();
      alert(`✅ ${hasil.message}`);
      tutupModal();
      window.location.href = "riwayat-saran.html";
    } catch (err) {
      console.error("❌ Gagal menyimpan saran:", err);
      alert("Terjadi kesalahan saat menyimpan saran.");
    }
  });

  // === Tombol Tutup Modal ===
  document.getElementById("btnTutup").addEventListener("click", tutupModal);

  // === Logout ===
  document.getElementById("btnLogout").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "login-pegawai.html";
  });
});