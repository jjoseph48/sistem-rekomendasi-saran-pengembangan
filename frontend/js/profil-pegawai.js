document.addEventListener("DOMContentLoaded", async () => {
  const nip = sessionStorage.getItem("nip");
  if (!nip) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "login-pegawai.html";
    return;
  }

  const profilDiv = document.getElementById("profilPegawai");
  const tabelBody = document.querySelector("#tabelSaran tbody");

  let semuaSaran = [];
  let semuaFeedback = {};
  let saranDipilih = null;

  // === 1. Ambil Data Profil Pegawai ===
  try {
    const res = await fetch(`/api/pegawai/${nip}`);
    const data = await res.json();

    if (!data || !data.nama) throw new Error("Data pegawai tidak ditemukan");

    profilDiv.innerHTML = `
      <p><strong>Nama:</strong> ${data.nama}</p>
      <p><strong>NIP:</strong> ${data.nip}</p>
      <p><strong>Jabatan:</strong> ${data.jabatan}</p>
      <p><strong>Unit Kerja:</strong> ${data.unit_kerja}</p>
    `;
  } catch (err) {
    console.error("Gagal memuat profil:", err);
    profilDiv.innerHTML = `<p style="color:red;">Gagal memuat profil pegawai.</p>`;
  }

  // === 2. Ambil Data Feedback ===
  try {
    const res = await fetch(`/api/feedback`);
    const feedbackList = await res.json();
    semuaFeedback = Object.fromEntries(
      feedbackList.map((f) => [f.id, f.kategori])
    );
  } catch (err) {
    console.error("Gagal memuat feedback:", err);
  }

  // === 3. Ambil Saran Pengembangan Pegawai ===
  try {
    const res = await fetch(`/api/pegawai/saran/${nip}`);
    semuaSaran = await res.json();
    renderTabelSaran();
  } catch (err) {
    console.error("Gagal memuat saran:", err);
    tabelBody.innerHTML = `<tr><td colspan='5'>Gagal memuat data saran.</td></tr>`;
  }

  // === Fungsi render tabel saran ulang ===
  function renderTabelSaran() {
    tabelBody.innerHTML = "";

    if (semuaSaran.length === 0) {
      tabelBody.innerHTML =
        "<tr><td colspan='5'>Belum ada saran pengembangan.</td></tr>";
      return;
    }

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

    semuaSaran.forEach((item) => {
      const saranId = item.saran_id || item.id;
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
      tabelBody.appendChild(tr);
    });

    // Tambahkan event tombol pilih
    document.querySelectorAll(".btn-pilih").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const saranId = parseInt(e.target.dataset.id);
        const saran = semuaSaran.find(
          (s) => s.id === saranId || s.saran_id === saranId
        );
        bukaModal(saran);
      });
    });
  }

  // === 4. Modal ===
  const modal = document.getElementById("modalKonfirmasi");
  const btnSimpan = document.getElementById("btnSimpan");
  const btnBatal = document.getElementById("btnBatal");

  function bukaModal(saran) {
    saranDipilih = saran;
    document.getElementById("isiModal").innerHTML = `
      <p>Apakah Anda yakin ingin memilih saran ini untuk kompetensi <strong>${saran.kompetensi}</strong>?</p>
      <p><em>${saran.saran_pengembangan}</em></p>
    `;
    modal.style.display = "block";
  }

  function tutupModal() {
    modal.style.display = "none";
    saranDipilih = null;
  }

  btnBatal.addEventListener("click", tutupModal);

  // === 5. Simpan Pilihan (tanpa reload) ===
  btnSimpan.addEventListener("click", async () => {
    if (!saranDipilih) return alert("Belum memilih saran!");

    const saranId = saranDipilih.id || saranDipilih.saran_id;
    const url = `/api/pegawai/saran/select/${saranId}`;

    try {
      const res = await fetch(url, { method: "PUT" });
      if (!res.ok) throw new Error("Gagal menyimpan saran");

      const hasil = await res.json();
      alert(`✅ ${hasil.message}`);

      // 🔹 Update array lokal
      semuaSaran.forEach((s) => {
        if (
          s.pegawai_id === saranDipilih.pegawai_id &&
          s.kompetensi === saranDipilih.kompetensi
        ) {
          s.is_selected = s.id === saranId || s.saran_id === saranId;
        }
      });

      tutupModal();
      renderTabelSaran();
    } catch (err) {
      console.error("❌ Gagal menyimpan saran:", err);
      alert("Terjadi kesalahan saat menyimpan saran.");
    }
  });

  // // === 6. Tombol Logout ===
  // document.getElementById("btnLogout").addEventListener("click", () => {
  //   localStorage.removeItem("nip");
  //   window.location.href = "login-pegawai.html";
  // });
});