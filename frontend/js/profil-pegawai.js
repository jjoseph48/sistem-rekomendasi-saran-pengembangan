const nip =
  new URLSearchParams(window.location.search).get("nip") ||
  localStorage.getItem("pegawai_nip");

const profilUrl = `http://localhost:8000/pegawai/profile/${nip}`;
const saranUrl = `http://localhost:8000/pegawai/saran/${nip}`;

let semuaSaran = []; // simpan seluruh data response JSON
let saranDipilih = null; // hanya menyimpan saran yang diklik

// === Ambil Data Profil ===
async function ambilProfil() {
  try {
    const res = await fetch(profilUrl);
    if (!res.ok) throw new Error("Gagal ambil profil");
    const data = await res.json();

    document.getElementById("nip").textContent = data.nip || "-";
    document.getElementById("nama").textContent = data.nama || "-";
    document.getElementById("jabatan").textContent = data.jabatan || "-";
    document.getElementById("satker").textContent = data.satker || "-";
    document.getElementById("kinerja").textContent = data.kinerja || "-";
  } catch (err) {
    console.error("Gagal ambil profil:", err);
  }
}

// === Ambil Data Saran ===
async function ambilSaran() {
  try {
    const res = await fetch(saranUrl);
    if (!res.ok) throw new Error("Gagal ambil saran");
    const data = await res.json();

    semuaSaran = data.riwayat_saran || [];
    const tbody = document.querySelector("#tabelSaran tbody");
    tbody.innerHTML = "";

    if (semuaSaran.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Belum ada saran pengembangan.</td></tr>";
      return;
    }

    // === Urutkan sesuai urutan kompetensi yang diinginkan ===
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

    // === Render tabel ===
    semuaSaran.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.kompetensi}</td>
        <td>${item.aspek_kompetensi}</td>
        <td>${item.saran_pengembangan}</td>
        <td><button class="btn-pilih" data-id="${item.saran_id}">Pilih</button></td>
      `;
      tbody.appendChild(tr);
    });

    // === Event listener tombol pilih ===
    document.querySelectorAll(".btn-pilih").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const saranId = parseInt(e.target.dataset.id);
        bukaModal(saranId);
      });
    });
  } catch (err) {
    console.error("Gagal ambil saran:", err);
  }
}

// === Modal ===
function bukaModal(saranId) {
  saranDipilih = semuaSaran.find((s) => s.saran_id === saranId); // ✅ cari berdasarkan saran_id

  if (!saranDipilih) {
    alert("Saran tidak ditemukan!");
    console.error("Saran ID tidak ditemukan:", saranId);
    return;
  }

  document.getElementById("modalText").textContent =
    `"${saranDipilih.saran_pengembangan}" (${saranDipilih.aspek_kompetensi})`;
  document.getElementById("modalSaran").style.display = "flex";
}

function tutupModal() {
  document.getElementById("modalSaran").style.display = "none";
  saranDipilih = null;
}

// === Simpan Pilihan (PUT /pegawai/saran/select/{saran_id}) ===
document.getElementById("btnSimpan").addEventListener("click", async () => {
  if (!saranDipilih || !saranDipilih.saran_id) {
    alert("Saran belum dipilih dengan benar!");
    return;
  }

  try {
    const url = `http://localhost:8000/pegawai/saran/select/${saranDipilih.saran_id}`;
    const res = await fetch(url, { method: "PUT" });

    if (!res.ok) throw new Error("Gagal menyimpan saran");
    const hasil = await res.json();

    alert(`✅ ${hasil.message}`);
    tutupModal();
    window.location.href = "riwayat-saran.html";
  } catch (err) {
    console.error("Gagal simpan saran:", err);
    alert("Terjadi kesalahan saat menyimpan saran.");
  }
});

// === Logout ===
function logout() {
  localStorage.clear();
  window.location.href = "login-pegawai.html";
}

// === Inisialisasi ===
ambilProfil();
ambilSaran();