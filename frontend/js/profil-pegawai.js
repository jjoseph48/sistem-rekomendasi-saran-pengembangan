const nip = new URLSearchParams(window.location.search).get("nip") || "121212";
const profilUrl = `http://localhost:8000/pegawai/profil/${nip}`;
const saranUrl = `http://localhost:8000/pegawai/saran/${nip}`;

let saranDipilih = null;

// === Ambil Data Profil ===
async function ambilProfil() {
  try {
    const res = await fetch(profilUrl);
    const data = await fetch(saranUrl);

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
    const data = await res.json();

    const tbody = document.querySelector("#tabelSaran tbody");
    tbody.innerHTML = "";

    data.riwayat_saran.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.kompetensi}</td>
        <td>${item.aspek_kompetensi}</td>
        <td>${item.saran_pengembangan}</td>
        <td>${new Date(item.tanggal_rekomendasi).toLocaleDateString()}</td>
        <td><button onclick="bukaModal(${i})">Pilih</button></td>
      `;
      tbody.appendChild(tr);
    });

    window.daftarSaran = data.riwayat_saran;
  } catch (err) {
    console.error("Gagal ambil saran:", err);
  }
}

// === Modal ===
function bukaModal(index) {
  saranDipilih = window.daftarSaran[index];
  document.getElementById("modalText").textContent = `"${saranDipilih.saran_pengembangan}" (${saranDipilih.aspek_kompetensi})`;
  document.getElementById("modalSaran").style.display = "flex";
}

function tutupModal() {
  document.getElementById("modalSaran").style.display = "none";
}

// === Simpan Pilihan ===
document.getElementById("btnSimpan").addEventListener("click", async () => {
  if (!saranDipilih) return;
  try {
    await fetch(`${saranUrl}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saran_pengembangan: saranDipilih.saran_pengembangan,
        is_selected: true,
      }),
    });
    window.location.href = "riwayat-saran.html";
  } catch (err) {
    console.error("Gagal simpan saran:", err);
  }
});

// === Logout ===
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// === Inisialisasi ===
ambilProfil();
ambilSaran();