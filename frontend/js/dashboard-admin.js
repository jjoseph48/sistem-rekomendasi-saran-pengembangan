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

  // API base
  const API_BASE = "http://localhost:8000";

  // Data containers
  let pegawaiData = [];
  let saranData = [];
  let feedbackCategories = []; // {id, feedback}
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
    try {
      const res = await fetch(`${API_BASE}/admin/pegawai`);
      if (!res.ok) throw new Error("Gagal mengambil data pegawai");
      pegawaiData = await res.json();
      renderPegawai(pegawaiData);
    } catch (err) {
      console.error(err);
      pegawaiTable.innerHTML = `<tr><td colspan="5">Gagal memuat data pegawai.</td></tr>`;
    }
  }

  async function loadSaran() {
    try {
      const res = await fetch(`${API_BASE}/admin/saran`);
      if (!res.ok) throw new Error("Gagal mengambil data saran");
      const data = await res.json();
      // Hanya tampilkan saran yang sudah dipilih pegawai
      saranData = data.filter(s => s.is_selected === true || s.is_selected === 1);
      renderSaran(saranData);
    } catch (err) {
      console.error(err);
      saranTable.innerHTML = `<tr><td colspan="6">Gagal memuat data saran.</td></tr>`;
    }
  }

  // Ambil daftar kategori feedback dari backend agar dropdown dinamis
  async function loadFeedbackCategories() {
    try {
      const res = await fetch(`${API_BASE}/feedback`);
      if (!res.ok) {
        // kalau backend mengembalikan 404 atau semacamnya, tetap isi default minimal
        console.warn("Tidak dapat mengambil kategori feedback, gunakan opsi default.");
        feedbackCategories = [
          { id: 1, feedback: "Tidak Ada" },
          { id: 2, feedback: "Tidak Efektif" },
          { id: 3, feedback: "Kurang Efektif" },
          { id: 4, feedback: "Cukup Efektif" },
          { id: 5, feedback: "Efektif" },
          { id: 6, feedback: "Sangat Efektif" }
        ];
      } else {
        feedbackCategories = await res.json();
      }

      populateFeedbackSelect();
    } catch (err) {
      console.error("Gagal load kategori feedback:", err);
      // fallback
      feedbackCategories = [
        { id: 1, feedback: "Tidak Ada" },
        { id: 2, feedback: "Tidak Efektif" },
        { id: 3, feedback: "Kurang Efektif" },
        { id: 4, feedback: "Cukup Efektif" },
        { id: 5, feedback: "Efektif" },
        { id: 6, feedback: "Sangat Efektif" }
      ];
      populateFeedbackSelect();
    }
  }

  function populateFeedbackSelect() {
    // kosongkan
    feedbackSelect.innerHTML = "";
    // buat option default kosong (pilihan wajib)
    feedbackCategories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = String(cat.id); // value sebagai string, parseInt saat pakai
      opt.textContent = cat.feedback;
      feedbackSelect.appendChild(opt);
    });
  }

  // ==========================
  // RENDER FUNCTIONS
  // ==========================
  function renderPegawai(data) {
    pegawaiTable.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
      pegawaiTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data pegawai.</td></tr>`;
      return;
    }
    data.forEach(p => {
      pegawaiTable.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${escapeHtml(p.nama)}</td>
          <td>${escapeHtml(p.nip)}</td>
          <td>${escapeHtml(p.satker)}</td>
          <td>${escapeHtml(p.jabatan)}</td>
          <td>${escapeHtml(p.kinerja)}</td>
        </tr>`);
    });
  }

  function renderSaran(data) {
    saranTable.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
      saranTable.innerHTML = `
        <tr><td colspan="6" style="text-align:center;">Belum ada saran yang dipilih pegawai.</td></tr>`;
      return;
    }

    data.forEach(s => {
      saranTable.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${escapeHtml(s.nama_pegawai)}</td>
          <td>${escapeHtml(s.kompetensi)}</td>
          <td>${escapeHtml(s.aspek_kompetensi)}</td>
          <td>${escapeHtml(s.saran_pengembangan)}</td>
          <td>${escapeHtml(s.feedback || "Tidak ada feedback")}</td>
          <td><button class="edit-btn" data-id="${s.id}">Edit</button></td>
        </tr>`);
    });
  }

  // simple escape to avoid accidental HTML injection from API strings
  function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ==========================
  // SEARCH & FILTER
  // ==========================
  searchPegawai.addEventListener("input", e => filterTable(e.target.value, "#pegawaiTable"));
  searchSaran.addEventListener("input", e => filterTable(e.target.value, "#saranTable"));

  function filterTable(keyword, selector) {
    const val = (keyword || "").toLowerCase();
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
      selectedSaran = saranData.find(s => String(s.id) === String(id));
      if (!selectedSaran) {
        alert("Saran tidak ditemukan, refresh halaman.");
        return;
      }

      document.getElementById("modalNama").textContent = `Nama: ${selectedSaran.nama_pegawai}`;
      saranEdit.value = selectedSaran.saran_pengembangan || "";

      // set feedbackSelect to the current feedback_id if available and exists in categories
      const currentId = selectedSaran.feedback_id || null;
      if (currentId && feedbackCategories.some(c => Number(c.id) === Number(currentId))) {
        feedbackSelect.value = String(currentId);
      } else {
        // fallback to first option if not found
        feedbackSelect.selectedIndex = 0;
      }

      modal.style.display = "flex";
    }
  });

  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const newSaran = saranEdit.value;
    const newFeedbackId = parseInt(feedbackSelect.value, 10);

    // Validasi feedback id harus ada di daftar kategori
    if (!feedbackCategories.some(c => Number(c.id) === Number(newFeedbackId))) {
      alert("Kategori feedback tidak valid. Silakan pilih kembali.");
      return;
    }

    try {
      // 1) Update teks saran (jika berubah)
      if (newSaran !== selectedSaran.saran_pengembangan) {
        const res1 = await fetch(`${API_BASE}/admin/saran/${selectedSaran.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saran_pengembangan: newSaran })
        });
        if (!res1.ok) {
          const err = await res1.json().catch(() => ({}));
          throw new Error(err.detail || "Gagal memperbarui saran.");
        }
      }

      // 2) Update feedback_id via query parameter sesuai API baru
      const res2 = await fetch(
        `${API_BASE}/admin/saran/feedback/${selectedSaran.id}?feedback_id=${newFeedbackId}`,
        { method: "PUT" }
      );
      if (!res2.ok) {
        const err = await res2.json().catch(() => ({}));
        throw new Error(err.detail || "Gagal memperbarui feedback.");
      }

      const result = await res2.json();
      // Tampilkan pesan sukses dari server jika ada
      if (result && result.message) alert(result.message);
      else alert("Perubahan berhasil disimpan.");

      modal.style.display = "none";
      // Refresh data
      await loadSaran();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan perubahan. Cek konsol untuk detail.");
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
    await loadFeedbackCategories(); // must load categories first
    await loadPegawai();
    await loadSaran();
  })();
});