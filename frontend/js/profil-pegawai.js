document.addEventListener("DOMContentLoaded", async () => {
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
  const feedbackUrl = `http://localhost:8000/feedback`; // <== endpoint feedback

  let semuaSaran = [];
  let semuaFeedback = {};
  let saranDipilih = null;

  // === Ambil Feedback (untuk translate feedback_id) ===
  try {
    const resFeedback = await fetch(feedbackUrl);
    if (!resFeedback.ok) throw new Error("Gagal mengambil data feedback");

    const dataFeedback = await resFeedback.json();

    // asumsikan dataFeedback = [{ id: 1, feedback: "Perlu pendampingan mentor" }, ...]
    dataFeedback.forEach((fb) => {
      semuaFeedback[fb.id] = fb.feedback;
    });

    console.log("✅ Data feedback berhasil dimuat:", semuaFeedback);
  } catch (err) {
    console.error("❌ Gagal memuat feedback:", err);
  }

  // === Ambil Profil ===
  try {
    const resProfil = await fetch(profilUrl);
    if (!resProfil.ok) throw new Error("Gagal mengambil profil pegawai");
    const profil = await resProfil.json();

    document.getElementById("nip").textContent = profil.nip || "-";
    document.getElementById("nama").textContent = profil.nama || "-";
    document.getElementById("jabatan").textContent = profil.jabatan || "-";
    document.getElementById("satker").textContent = profil.satker || "-";
    document.getElementById("kinerja").textContent = profil.kinerja || "-";
  } catch (err) {
    console.error("❌ Gagal memuat profil:", err);
  }

  // === Ambil Saran Pengembangan ===
  try {
    const resSaran = await fetch(saranUrl);
    if (!resSaran.ok) throw new Error("Gagal mengambil data saran");

    const dataSaran = await resSaran.json();
    semuaSaran = dataSaran.riwayat_saran || [];

    const tbody = document.querySelector("#tabelSaran tbody");
    tbody.innerHTML = "";

    if (semuaSaran.length === 0) {
      tbody.innerHTML =
        "<tr><td colspan='5'>Belum ada saran pengembangan.</td></tr>";
      return;
    }

    // Urutkan berdasarkan kompetensi
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

    // Render tabel
    semuaSaran.forEach((item) => {
      const saranId = item.saran_id || item.id;

      // translate feedback_id ke teks feedback
      const feedbackText =
        semuaFeedback[item.feedback_id] ||
        item.feedback ||
        "Tidak Ada Feedback";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.kompetensi || "-"}</td>
        <td>${item.aspek_kompetensi || "-"}</td>
        <td>${item.saran_pengembangan || "-"}</td>
        <td>${feedbackText}</td>
        <td>
          <button class="btn-pilih" data-id="${saranId}" ${
        item.is_selected ? "disabled" : ""
      }>
            ${item.is_selected ? "Sudah Dipilih" : "Pilih"}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Event listener tombol pilih
    document.querySelectorAll(".btn-pilih").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const saranId = parseInt(e.target.dataset.id);
        bukaModal(saranId);
      });
    });
  } catch (err) {
    console.error("❌ Gagal memuat data saran:", err);
  }

  // === Modal ===
  function bukaModal(saranId) {
    saranDipilih = semuaSaran.find(
      (s) => s.id === saranId || s.saran_id === saranId
    );
    if (!saranDipilih) {
      alert("Saran tidak ditemukan!");
      return;
    }

    document.getElementById("modalText").textContent = `"${saranDipilih.saran_pengembangan}" (${saranDipilih.aspek_kompetensi})`;
    document.getElementById("modalSaran").style.display = "flex";
  }

  function tutupModal() {
    document.getElementById("modalSaran").style.display = "none";
    saranDipilih = null;
  }

  // === Simpan Pilihan ===
  document.getElementById("btnSimpan").addEventListener("click", async () => {
    if (!saranDipilih) return alert("Belum memilih saran!");

    const saranId = saranDipilih.id || saranDipilih.saran_id;
    const url = `http://localhost:8000/pegawai/saran/select/${saranId}`;

    try {
      const res = await fetch(url, { method: "PUT" });
      if (!res.ok) throw new Error("Gagal menyimpan saran");

      const hasil = await res.json();
      alert(`✅ ${hasil.message}`);
      tutupModal();
      location.reload();
    } catch (err) {
      console.error("❌ Gagal menyimpan saran:", err);
      alert("Terjadi kesalahan saat menyimpan saran.");
    }
  });

  // === Tutup Modal ===
  document.getElementById("btnTutup").addEventListener("click", tutupModal);

  // === Logout ===
  document.getElementById("btnLogout").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "login-pegawai.html";
  });
});