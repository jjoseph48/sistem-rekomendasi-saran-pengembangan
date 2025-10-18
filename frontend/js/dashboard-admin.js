document.addEventListener("DOMContentLoaded", () => {
  const tabPegawai = document.getElementById("tabPegawai");
  const tabSaran = document.getElementById("tabSaran");
  const pegawaiContent = document.getElementById("pegawaiContent");
  const saranContent = document.getElementById("saranContent");
  const pegawaiTable = document.querySelector("#pegawaiTable tbody");
  const saranTable = document.querySelector("#saranTable tbody");
  const searchPegawai = document.getElementById("searchPegawai");
  const searchSaran = document.getElementById("searchSaran");
  const modal = document.getElementById("editModal");

  let pegawaiData = [];
  let saranData = [];
  let selectedSaran = null;

  // Tab Switching
  tabPegawai.addEventListener("click", () => switchTab(tabPegawai, pegawaiContent));
  tabSaran.addEventListener("click", () => switchTab(tabSaran, saranContent));

  function switchTab(tab, content) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");

    tab.classList.add("active");
    content.style.display = "block";
}


  // === LOAD PEGAWAI ===
  async function loadPegawai() {
    const res = await fetch("http://localhost:8000/admin/pegawai");
    pegawaiData = await res.json();
    renderPegawai(pegawaiData);
  }

  // === LOAD SARAN ===
  async function loadSaran() {
    const res = await fetch("http://localhost:8000/admin/saran");
    saranData = await res.json();

    // Match nama pegawai berdasarkan ID
    saranData.forEach(s => {
      const matchPegawai = pegawaiData.find(p => p.id === s.pegawai_id);
      s.nama_pegawai = matchPegawai ? matchPegawai.nama : "Tidak Diketahui";
    });

    renderSaran(saranData);
  }

  // === RENDER PEGAWAI ===
  function renderPegawai(data) {
    pegawaiTable.innerHTML = "";
    data.forEach(p => {
      const row = `
        <tr>
          <td>${p.nama}</td>
          <td>${p.nip}</td>
          <td>${p.satker}</td>
          <td>${p.jabatan}</td>
          <td>${p.kinerja}</td>
        </tr>`;
      pegawaiTable.insertAdjacentHTML("beforeend", row);
    });
  }

  // === RENDER SARAN ===
  function renderSaran(data) {
    saranTable.innerHTML = "";
    data.forEach(s => {
      const row = `
        <tr>
          <td>${s.nama_pegawai}</td>
          <td>${s.kompetensi}</td>
          <td>${s.aspek_kompetensi}</td>
          <td>${s.saran_pengembangan}</td>
          <td>${s.feedback_terakhir}</td>
          <td>
            <button class="action-btn edit-btn" data-id="${s.id}">Edit</button>
            <button class="action-btn delete-btn" data-id="${s.id}">Hapus</button>
          </td>
        </tr>`;
      saranTable.insertAdjacentHTML("beforeend", row);
    });
  }

  // === PENCARIAN ===
  searchPegawai.addEventListener("input", e => {
    const val = e.target.value.toLowerCase();
    document.querySelectorAll("#pegawaiTable tbody tr").forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
  });

  searchSaran.addEventListener("input", e => {
    const val = e.target.value.toLowerCase();
    document.querySelectorAll("#saranTable tbody tr").forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
  });

  // === HANDLER EDIT & DELETE ===
  document.body.addEventListener("click", async e => {
    if (e.target.classList.contains("edit-btn")) {
      const id = e.target.dataset.id;
      selectedSaran = saranData.find(s => s.id == id);
      document.getElementById("modalNama").textContent = `Nama: ${selectedSaran.nama_pegawai}`;
      document.getElementById("saranEdit").value = selectedSaran.saran_pengembangan;
      document.getElementById("feedbackSelect").value = selectedSaran.feedback_terakhir;
      modal.style.display = "flex";
    }

    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      if (confirm("Yakin ingin menghapus saran ini?")) {
        await fetch(`http://localhost:8000/admin/saran/${id}`, { method: "DELETE" });
        loadSaran();
      }
    }
  });

  // === MODAL ACTION ===
  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const feedback = document.getElementById("feedbackSelect").value;
    const saranBaru = document.getElementById("saranEdit").value;

    await fetch(`http://localhost:8000/admin/${selectedSaran.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saran_pengembangan: saranBaru,
        feedback_terakhir: feedback,
      }),
    });

    modal.style.display = "none";
    loadSaran();
  });

  // === LOGOUT ===
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("adminUser");
    window.location.href = "login-admin.html";
  });

  // === INITIAL LOAD ===
  (async function init() {
    await loadPegawai(); // pastikan pegawai sudah dimuat
    await loadSaran();   // baru render saran dengan nama pegawai yang sesuai
  })();
});