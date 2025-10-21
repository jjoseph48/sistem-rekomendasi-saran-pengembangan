// ================================
// 📄 profil-pegawai.js
// ================================

document.addEventListener("DOMContentLoaded", async () => {
  const nip = new URLSearchParams(window.location.search).get("nip") ||
  sessionStorage.getItem("nip");
  console.log("NIP Pegawai:", nip);
  if (!nip) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "login-pegawai.html";
    return;
  }

  const baseUrl = "/api"; // sesuaikan jika beda host
  const tabelKompetensi = document.querySelector("#tabelKompetensi tbody");
  const tabelSaran = document.querySelector("#tabelSaran tbody");

  // Elemen profil dari tabel HTML
  const elNama = document.getElementById("nama");
  const elNip = document.getElementById("nip");
  const elSatker = document.getElementById("satker");
  const elJabatan = document.getElementById("jabatan");
  const elKinerja = document.getElementById("kinerja");

  // Modal edit kompetensi
  const modalEdit = document.getElementById("modalEditKompetensi");
  const formEdit = document.getElementById("formEditKompetensi");
  const btnBatalEdit = document.getElementById("btnBatalEdit");

  // Modal konfirmasi saran
  const modalSaran = document.getElementById("modalSaran");
  const modalText = document.getElementById("modalText");
  const btnSimpan = document.getElementById("btnSimpan");
  const btnTutup = document.getElementById("btnTutup");

  let selectedKompetensi = null;
  let selectedSaran = null;
  let kompetensiData = [];

  // ================================
  // 🔹 1. Ambil Profil Pegawai
  // ================================
  async function loadProfil() {
    try {
      const res = await fetch(`${baseUrl}/pegawai/${nip}`);
      if (!res.ok) throw new Error("Gagal mengambil profil pegawai");
      const data = await res.json();

      // isi tabel profil
      elNama.textContent = data.nama || "-";
      elNip.textContent = data.nip || "-";
      elSatker.textContent = data.satker || "-";
      elJabatan.textContent = data.jabatan || "-";
      elKinerja.textContent = data.kinerja || "-";
    } catch (err) {
      console.error(err);
      alert("❌ Gagal memuat data profil pegawai.");
    }
  }

  // ================================
  // 🔹 2. Ambil Data Kompetensi
  // ================================
  async function loadKompetensi() {
    try {
      const res = await fetch(`${baseUrl}/kompetensi/${nip}`);
      if (!res.ok) throw new Error("Gagal mengambil data kompetensi");
      kompetensiData = await res.json();

      if (!kompetensiData.length) {
        tabelKompetensi.innerHTML = `<tr><td colspan="5">Tidak ada data kompetensi.</td></tr>`;
        return;
      }

      tabelKompetensi.innerHTML = "";
      kompetensiData.forEach((k) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${k.kompetensi}</td>
          <td>${k.standar_level}</td>
          <td>${k.capaian_nilai}</td>
          <td>${k.gap}</td>
          <td><button class="btnEdit" data-id="${k.id}">✏️ Edit</button></td>
        `;
        tabelKompetensi.appendChild(tr);
      });

      // Tombol edit
      document.querySelectorAll(".btnEdit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = parseInt(e.target.dataset.id);
          const data = kompetensiData.find((d) => d.id === id);
          if (data) openEditModal(data);
        });
      });
    } catch (err) {
      console.error(err);
      tabelKompetensi.innerHTML = `<tr><td colspan="5">Gagal memuat data kompetensi.</td></tr>`;
    }
  }

  // ================================
  // 🔹 3. Modal Edit Kompetensi
  // ================================
  function openEditModal(data) {
    selectedKompetensi = data;
    document.getElementById("editStandar").value = data.standar_level;
    document.getElementById("editCapaian").value = data.capaian_nilai;
    document.getElementById("editGap").value = data.gap;
    modalEdit.style.display = "flex";
  }

  btnBatalEdit.addEventListener("click", () => {
    modalEdit.style.display = "none";
  });

  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedData = {
      id: selectedKompetensi.id, // kirim kompetensi_id
      nip,
      standar_level: parseFloat(document.getElementById("editStandar").value),
      capaian_nilai: parseFloat(document.getElementById("editCapaian").value),
      gap: parseFloat(document.getElementById("editGap").value),
    };

    try {
      const res = await fetch(`${baseUrl}/kompetensi/update/${updatedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Gagal memperbarui data kompetensi");

      alert("✅ Data kompetensi berhasil diperbarui!");
      modalEdit.style.display = "none";
      loadKompetensi();
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan saat memperbarui data kompetensi.");
    }
  });

  // ================================
  // 🔹 4. Ambil Data Saran Pengembangan
  // ================================
  async function loadSaran() {
    try {
      const res = await fetch(`${baseUrl}/saran?nip=${nip}`);
      if (!res.ok) throw new Error("Gagal mengambil saran pengembangan");
      const data = await res.json();

      if (!data.length) {
        tabelSaran.innerHTML = `<tr><td colspan="5">Belum ada saran pengembangan.</td></tr>`;
        return;
      }

      tabelSaran.innerHTML = "";
      data.forEach((s) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${s.kompetensi}</td>
          <td>${s.aspek_kompetensi || "-"}</td>
          <td>${s.saran_pengembangan}</td>
          <td>${s.feedback_terakhir || "-"}</td>
          <td>
            <button class="btnPilih" data-id="${s.id}" ${s.is_selected ? "disabled" : ""}>
              ${s.is_selected ? "✅ Dipilih" : "Pilih"}
            </button>
          </td>
        `;
        tabelSaran.appendChild(tr);
      });

      document.querySelectorAll(".btnPilih").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = parseInt(e.target.dataset.id);
          const saran = data.find((d) => d.id === id);
          if (saran) openModalSaran(saran);
        });
      });
    } catch (err) {
      console.error(err);
      tabelSaran.innerHTML = `<tr><td colspan="5">Gagal memuat saran pengembangan.</td></tr>`;
    }
  }

  // ================================
  // 🔹 5. Modal Konfirmasi Pilih Saran
  // ================================
  function openModalSaran(saran) {
    selectedSaran = saran;
    modalText.textContent = `Apakah Anda yakin ingin memilih saran "${saran.saran_pengembangan}" untuk kompetensi "${saran.kompetensi}"?`;
    modalSaran.style.display = "flex";
  }

  btnTutup.addEventListener("click", () => {
    modalSaran.style.display = "none";
  });

  btnSimpan.addEventListener("click", async () => {
    if (!selectedSaran) return;

    try {
      const res = await fetch(`${baseUrl}/saran/select/${selectedSaran.id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Gagal memilih saran pengembangan");

      const result = await res.json();
      alert(`✅ ${result.message}`);
      modalSaran.style.display = "none";
      loadSaran();
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan pilihan saran.");
    }
  });

  // ================================
  // 🚀 Inisialisasi
  // ================================
  await loadProfil();
  await loadKompetensi();
  await loadSaran();
});