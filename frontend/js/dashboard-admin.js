document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // ELEMENTS
  // ==========================
  const tabPegawai = document.getElementById("tabPegawai");
  const tabSaran = document.getElementById("tabSaran");
  const tabFeedback = document.getElementById("tabFeedback");
  const pegawaiContent = document.getElementById("pegawaiContent");
  const saranContent = document.getElementById("saranContent");
  const feedbackContent = document.getElementById("feedbackContent");

  const pegawaiTable = document.querySelector("#pegawaiTable tbody");
  const saranTable = document.querySelector("#saranTable tbody");
  const feedbackTable = document.querySelector("#feedbackTable tbody");

  const searchPegawai = document.getElementById("searchPegawai");
  const searchSaran = document.getElementById("searchSaran");
  const searchFeedback = document.getElementById("searchFeedback");
  const filterAspek = document.getElementById("filterAspek");

  const modal = document.getElementById("editModal");

  let pegawaiData = [];
  let saranData = [];
  let feedbackData = [];
  let selectedSaran = null;

  // ==========================
  // TAB SWITCH
  // ==========================
  [tabPegawai, tabSaran, tabFeedback].forEach(tab =>
    tab.addEventListener("click", () => switchTab(tab))
  );

  function switchTab(activeTab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => (c.style.display = "none"));

    activeTab.classList.add("active");
    if (activeTab === tabPegawai) pegawaiContent.style.display = "block";
    if (activeTab === tabSaran) saranContent.style.display = "block";
    if (activeTab === tabFeedback) feedbackContent.style.display = "block";
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
  let allSaran = await res.json();

  // 🔹 Hanya tampilkan saran yang dipilih pegawai
  saranData = allSaran.filter(s => s.is_selected === true || s.is_selected === 1);

  renderSaran(saranData);
  }

  async function loadFeedback() {
    const res = await fetch("http://localhost:8000/feedback");
    feedbackData = await res.json();
    renderFeedback(feedbackData);
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
      <tr><td colspan="6" style="text-align:center;">Belum ada saran yang dipilih pegawai.</td></tr>
    `;
    return;
  }

  data.forEach(s => {
    saranTable.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${s.nama_pegawai}</td>
        <td>${s.kompetensi}</td>
        <td>${s.aspek_kompetensi}</td>
        <td>${s.saran_pengembangan}</td>
        <td>${s.feedback_terakhir || "Tidak ada feedback"}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${s.id}">Edit</button>
          <button class="action-btn delete-btn" data-id="${s.id}">Hapus</button>
        </td>
      </tr>
    `);
  });
}

  function renderFeedback(data) {
    feedbackTable.innerHTML = "";
    data.forEach(fb => {
      feedbackTable.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${fb.nama_pegawai}</td>
          <td>${fb.kompetensi}</td>
          <td>${fb.aspek_kompetensi}</td>
          <td>${fb.feedback}</td>
          <td>${new Date(fb.tanggal_feedback).toLocaleDateString()}</td>
        </tr>`);
    });
  }

  // ==========================
  // FILTER & SEARCH
  // ==========================
  searchPegawai.addEventListener("input", e => filterTable(e.target.value, "#pegawaiTable"));
  searchSaran.addEventListener("input", e => filterTable(e.target.value, "#saranTable"));
  searchFeedback.addEventListener("input", e => filterTable(e.target.value, "#feedbackTable"));

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
      document.getElementById("saranEdit").value = selectedSaran.saran_pengembangan;
      document.getElementById("feedbackSelect").value = selectedSaran.feedback_terakhir || "Tidak ada feedback";
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

  document.getElementById("cancelEditBtn").addEventListener("click", () => (modal.style.display = "none"));

  document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const newFeedback = document.getElementById("feedbackSelect").value;
    const newSaran = document.getElementById("saranEdit").value;

    // 🧩 Update Saran Pengembangan
    if (newSaran && newSaran !== selectedSaran.saran_pengembangan) {
      await fetch(`http://localhost:8000/admin/${selectedSaran.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saran_pengembangan: newSaran })
      });
    }

    // 🧩 Update Feedback (jika berbeda)
    if (newFeedback && newFeedback !== selectedSaran.feedback_terakhir && selectedSaran.feedback_id) {
      await fetch(`http://localhost:8000/admin/feedback/${selectedSaran.feedback_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: newFeedback })
      });
    }

    modal.style.display = "none";
    await loadSaran();
    await loadFeedback();
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
    await loadFeedback();
  })();
});