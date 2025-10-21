const nip =
  new URLSearchParams(window.location.search).get("nip") ||
  sessionStorage.getItem("nip");

const apiBase = "/api";
const saranUrl = `${apiBase}/pegawai/saran/${nip}`;
const feedbackKategoriUrl = `${apiBase}/feedback/`; // GET semua kategori feedback
const kirimFeedbackBaseUrl = `${apiBase}/pegawai/saran/feedback`; // PUT /{saran_id}?feedback_id=x

let daftarSaran = [];
let daftarKategori = [];
let saranAktif = null;

// === Ambil semua data awal ===
document.addEventListener("DOMContentLoaded", async () => {
  await ambilKategoriFeedback();
  await ambilRiwayat();
});

// === Ambil daftar kategori feedback dari API ===
async function ambilKategoriFeedback() {
  try {
    const res = await fetch(feedbackKategoriUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },});
    // const res = await fetch(feedbackKategoriUrl);
    if (!res.ok) throw new Error("Gagal mengambil kategori feedback");

    const data = await res.json();
    daftarKategori = data;

    const select = document.getElementById("inputFeedback");
    select.innerHTML = '<option value="">-- Pilih --</option>';
    data.forEach((fb) => {
      const opt = document.createElement("option");
      opt.value = fb.id; // 🔹 Gunakan ID feedback
      opt.textContent = fb.feedback;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ Gagal load kategori feedback:", err);
    alert("Tidak dapat memuat daftar feedback.");
  }
}

// === Ambil saran yang dipilih pegawai ===
async function ambilRiwayat() {
  try {
    const res = await fetch(saranUrl);
    if (!res.ok) throw new Error("Gagal mengambil data saran.");

    const data = await res.json();
    daftarSaran = (data.riwayat_saran || []).filter((s) => s.is_selected);
    renderTabel();
  } catch (err) {
    console.error("❌ Gagal memuat data:", err);
    const tbody = document.querySelector("#tabelRiwayat tbody");
    tbody.innerHTML = `<tr><td colspan="6">Terjadi kesalahan: ${err.message}</td></tr>`;
  }
}

// === Render tabel saran + feedback ===
function renderTabel() {
  const tbody = document.querySelector("#tabelRiwayat tbody");
  tbody.innerHTML = "";

  if (daftarSaran.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6'>Belum ada saran yang dipilih.</td></tr>";
    return;
  }

  daftarSaran.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.kompetensi || "-"}</td>
      <td>${item.aspek_kompetensi || "-"}</td>
      <td>${item.saran_pengembangan || "-"}</td>
      <td>${item.feedback || "Tidak Ada Feedback"}</td>
      <td>
        <button class="btn-feedback" data-id="${item.saran_id}">
          ${item.feedback && item.feedback !== "Tidak Ada Feedback" ? "Edit ✏️" : "Feedback 💬"}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-feedback").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      bukaModalFeedback(id);
    });
  });
}

// === Buka modal feedback ===
function bukaModalFeedback(saranId) {
  saranAktif = daftarSaran.find((s) => s.saran_id === saranId);
  if (!saranAktif) {
    alert("Saran tidak ditemukan!");
    return;
  }

  document.getElementById("modalJudul").textContent =
    saranAktif.feedback && saranAktif.feedback !== "Tidak Ada Feedback"
      ? "Edit Feedback"
      : "Berikan Feedback";

  document.getElementById("modalSaranTeks").textContent =
    `"${saranAktif.saran_pengembangan}" (${saranAktif.aspek_kompetensi})`;

  const select = document.getElementById("inputFeedback");

  // Pilih option sesuai feedback yang sudah ada
  const currentFeedback = daftarKategori.find((f) => f.feedback === saranAktif.feedback);
  select.value = currentFeedback ? currentFeedback.id : "";

  document.getElementById("modalFeedback").style.display = "flex";
}

function tutupModalFeedback() {
  document.getElementById("modalFeedback").style.display = "none";
  saranAktif = null;
}

// === Kirim feedback (PUT ke /pegawai/saran/feedback/{saran_id}?feedback_id=x) ===
document.getElementById("btnKirimFeedback").addEventListener("click", async () => {
  const select = document.getElementById("inputFeedback");
  const feedbackId = select.value;

  if (!saranAktif || !feedbackId) {
    alert("Silakan pilih salah satu opsi feedback!");
    return;
  }

  const url = `${kirimFeedbackBaseUrl}/${saranAktif.saran_id}?feedback_id=${feedbackId}`;

  try {
    const res = await fetch(url, { method: "PUT" });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    alert(`✅ ${result.message || "Feedback berhasil disimpan!"}`);
    tutupModalFeedback();
    await ambilRiwayat();
  } catch (err) {
    console.error("❌ Gagal kirim feedback:", err);
    alert("Terjadi kesalahan saat menyimpan feedback.");
  }
});

// === Logout ===
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "login-pegawai.html";
}