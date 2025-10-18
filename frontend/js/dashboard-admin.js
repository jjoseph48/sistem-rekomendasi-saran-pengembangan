document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // ELEMENTS
  // ==========================
  const tabPegawai = document.getElementById("tabPegawai");
  const tabSaran = document.getElementById("tabSaran");
  const pegawaiContent = document.getElementById("pegawaiContent");
  const saranContent = document.getElementById("saranContent");

  const pegawaiTable = document.querySelector("#pegawaiTable tbody");
  const saranTable = document.querySelector("#saranTable tbody");

  const searchPegawai = document.getElementById("searchPegawai");
  const searchSaran = document.getElementById("searchSaran");
  const filterAspek = document.getElementById("filterAspek");

  const modal = document.getElementById("editModal");
  const feedbackSelect = document.getElementById("feedbackSelect");
  const saranEdit = document.getElementById("saranEdit");

  let pegawaiData = [];
  let saranData = [];
  let selectedSaran = null;

  // ==========================
  // TAB SWITCH
  // ==========================
  [tabPegawai, tabSaran].forEach(tab =>
    tab.addEventListener("click", () => switchTab(tab))
  );

  function switchTab(activeTab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => (c.style.display = "none"));
    activeTab.classList.add("active");
    if (activeTab === tabPegawai) pegawaiContent.style.display = "block";
    if (activeTab === tabSaran) saranContent.style.display = "block";
  }

  // ==========================
  // LOAD DATA
  // ==========================
  async function loadPegawai() {
    const res = await fetch("http://localhost:8000/admin/pegawai");
    pegawaiData = await res.json();
    renderPegawai(pegawaiData);
  }

  async function loadSaran() {
    const res = await fetch("http://localhost:8000/admin/saran");
    const data = await res.json();
    // Hanya tampilkan saran yang sudah dipilih pegawai
    saranData = data.filter(s => s.is_selected === true || s.is_selected === 1);
    renderSaran(saranData);
  }

  // ==========================
  // RENDER FUNCTIONS
  // ==========================
  function renderPegawai(data) {
    pegawaiTable.innerHTML = "";
    data.forEach(p => {
      pegawaiTable.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${p.nama}</td>
          <td>${p.nip}</td>
          <td>${p.satker}</td>
          <td>${p.jabatan}</td>
          <td>${p.kinerja}</td>
        </tr>`);
    });
  }

  function renderSaran(data) {
    saranTable.innerHTML = "";
    if (data.length === 0) {
      saranTable.innerHTML = `
        <tr><td colspan="6" style="text-align:center;">Belum ada saran yang dipilih pegawai.</td></tr>`;
      return;
    }

    data.forEach(s => {
      saranTable.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${s.nama_pegawai}</td>
          <td>${s.kompetensi}</td>
          <td>${s.aspek_kompetensi}</td>
          <td>${s.saran_pengembangan}</td>
          <td>${s.feedback || "Tidak ada feedback"}</td>
          <td><button class="edit-btn" data-id="${s.id}">Edit</button></td>
        </tr>`);
    });
  }

  // ==========================
  // SEARCH & FILTER
  // ==========================
  searchPegawai.addEventListener("input", e => filterTable(e.target.value, "#pegawaiTable"));
  searchSaran.addEventListener("input", e => filterTable(e.target.value, "#saranTable"));

  function filterTable(keyword, selector) {
    const val = keyword.toLowerCase();
    document.querySelectorAll(`${selector} tbody tr`).forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
  }

  filterAspek.addEventListener("change", e => {
    const val = e.target.value;
    const filtered = val ? saranData.filter(s => s.aspek_kompetensi === val) : saranData;
    renderSaran(filtered);
  });

  // ==========================
  // MODAL EDIT
  // ==========================
  document.body.addEventListener("click", async e => {
    if (e.target.classList.contains("edit-btn")) {
      const id = e.target.dataset.id;
      selectedSaran = saranData.find(s => s.id == id);

      document.getElementById("modalNama").textContent = `Nama: ${selectedSaran.nama_pegawai}`;
      saranEdit.value = selectedSaran.saran_pengembangan;
      feedbackSelect.value = selectedSaran.feedback_id || 1;

      modal.style.display = "flex";
    }
  });

  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const newSaran = saranEdit.value;
    const newFeedbackId = parseInt(feedbackSelect.value);

    try {
      // 🧩 1. Update teks saran
      const res1 = await fetch(`http://localhost:8000/admin/saran/${selectedSaran.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saran_pengembangan: newSaran })
      });
      if (!res1.ok) throw new Error("Gagal memperbarui saran.");

      // 🧩 2. Update feedback_id via query parameter (API baru)
      const res2 = await fetch(
        `http://localhost:8000/admin/saran/feedback/${selectedSaran.id}?feedback_id=${newFeedbackId}`,
        { method: "PUT" }
      );
      if (!res2.ok) throw new Error("Gagal memperbarui feedback.");

      const result = await res2.json();
      alert(result.message || "Perubahan berhasil disimpan.");

      modal.style.display = "none";
      await loadSaran();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  });

  // ==========================
  // LOGOUT
  // ==========================
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("adminUser");
    window.location.href = "login-admin.html";
  });

  // ==========================
  // INITIAL LOAD
  // ==========================
  (async function init() {
    await loadPegawai();
    await loadSaran();
  })();
});