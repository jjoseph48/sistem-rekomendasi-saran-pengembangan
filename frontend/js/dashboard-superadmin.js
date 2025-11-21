// =================== Base URL Backend =====================
const API_BASE = "http://localhost:8000";

// =================== Inisialisasi =====================
document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  await loadPegawai();
  await loadSaran();
  await loadAdmin();
});

// =================== Tabs =====================
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

// =================== Logout =====================
document.getElementById("logoutBtn").onclick = async () => {
  await fetch(`${API_BASE}/superadmin/logout`, { method: "POST" });
  localStorage.removeItem("superadminUser");
  window.location.href = "login-superadmin.html";
};

// =================== Pegawai =====================
async function loadPegawai() {
  const res = await fetch(`${API_BASE}/superadmin/pegawai`);
  const data = await res.json();
  const tbody = document.querySelector("#pegawaiTable tbody");
  tbody.innerHTML = "";
  data.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.nip}</td>
      <td>${p.nama}</td>
      <td>${p.satker}</td>
      <td>${p.jabatan}</td>
      <td>${p.kinerja || "-"}</td>
      <td><button class="btn btn-danger" onclick="deletePegawai('${p.nip}')">Hapus</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function deletePegawai(nip) {
  if (confirm("Yakin ingin menghapus pegawai ini?")) {
    const res = await fetch(`${API_BASE}/superadmin/pegawai/${nip}`, { method: "DELETE" });
    if (res.ok) {
      alert("Pegawai berhasil dihapus!");
      loadPegawai();
    }
  }
}

// =================== Saran Pengembangan =====================
async function loadSaran() {
  const res = await fetch(`${API_BASE}/superadmin/saran`);
  const data = await res.json();
  const tbody = document.querySelector("#saranTable tbody");
  tbody.innerHTML = "";
  data.forEach((s) => {
    const feedback = s.feedback_kategori || "-";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.nama_pegawai}</td>
      <td>${s.nip}</td>
      <td>${s.kompetensi}</td>
      <td>${s.aspek_kompetensi}</td>
      <td>${s.saran_pengembangan}</td>
      <td>${feedback}</td>
      <td>
        <button class="btn btn-primary" onclick="openEditFeedback(${s.id}, ${s.feedback_id || 1})">Edit</button>
        <button class="btn btn-danger" onclick="deleteSaran(${s.id})">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openEditFeedback(saranId, feedbackId) {
  document.getElementById("editSaranId").value = saranId;
  document.getElementById("editFeedbackSelect").value = feedbackId;
  document.getElementById("editFeedbackModal").style.display = "block";
}

document.getElementById("closeFeedbackModal").onclick = () => {
  document.getElementById("editFeedbackModal").style.display = "none";
};

document.getElementById("editFeedbackForm").onsubmit = async (e) => {
  e.preventDefault();
  const saranId = document.getElementById("editSaranId").value;
  const feedbackId = document.getElementById("editFeedbackSelect").value;

  const res = await fetch(`${API_BASE}/superadmin/saran/${saranId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedback_id: feedbackId })
  });

  if (res.ok) {
    alert("Feedback berhasil diperbarui!");
    document.getElementById("editFeedbackModal").style.display = "none";
    loadSaran();
  } else {
    const err = await res.json();
    alert("Gagal memperbarui feedback: " + err.detail);
  }
};

async function deleteSaran(id) {
  if (confirm("Yakin ingin menghapus saran ini?")) {
    const res = await fetch(`${API_BASE}/superadmin/saran/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Saran berhasil dihapus!");
      loadSaran();
    }
  }
}

// =================== Admin Management =====================
async function loadAdmin() {
  const res = await fetch(`${API_BASE}/superadmin/admin`);
  if (!res.ok) return; // skip jika belum tersedia
  const data = await res.json();
  const tbody = document.querySelector("#adminTable tbody");
  tbody.innerHTML = "";
  data.forEach((a) => {
    if (a.role === "admin") {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${a.id}</td>
        <td>${a.username}</td>
        <td>${a.role}</td>
        <td><button class="btn btn-danger" onclick="deleteAdmin(${a.id})">Hapus</button></td>
      `;
      tbody.appendChild(row);
    }
  });
}

document.getElementById("addAdminForm").onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById("newAdminUsername").value.trim();
  const password = document.getElementById("newAdminPassword").value.trim();

  const res = await fetch(`${API_BASE}/superadmin/register-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    alert("Admin baru berhasil ditambahkan!");
    loadAdmin();
    e.target.reset();
  } else {
    const err = await res.json();
    alert("Gagal menambah admin: " + err.detail);
  }
};

async function deleteAdmin(id) {
  if (confirm("Yakin ingin menghapus admin ini?")) {
    const res = await fetch(`${API_BASE}/superadmin/hapus-admin/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Admin berhasil dihapus!");
      loadAdmin();
    }
  }
}