// === Ambil NIP dari URL atau session ===
const nip =
  new URLSearchParams(window.location.search).get("nip") ||
  sessionStorage.getItem("nip");

const saranUrl = `http://localhost:8000/pegawai/saran/${nip}`;
const feedbackUrl = `http://localhost:8000/feedback`;

let daftarSaran = [];
let saranAktif = null;

// === Ambil Data Riwayat (Saran + Feedback) ===
async function ambilRiwayat() {
  try {
    if (!nip) throw new Error("NIP tidak ditemukan di sesi.");

    const [resSaran, resFeedback] = await Promise.all([
      fetch(saranUrl),
      fetch(`${feedbackUrl}/${nip}`),
    ]);

    if (!resSaran.ok) throw new Error("Gagal mengambil data saran");
    const dataSaran = await resSaran.json();

    const dataFeedback = resFeedback.ok ? await resFeedback.json() : [];

    daftarSaran = (dataSaran.riwayat_saran || [])
      .filter((s) => s.is_selected)
      .map((s) => ({
        ...s,
        feedback_terakhir:
          dataFeedback.find((f) => f.saran_id === s.saran_id)?.feedback ||
          s.feedback_terakhir ||
          null,
      }));

    renderTabel();
  } catch (err) {
    console.error("❌ Gagal memuat data:", err);
    const tbody = document.querySelector("#tabelRiwayat tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6">Terjadi kesalahan: ${err.message}</td></tr>`;
    }
  }
}

// === Render Data ke Tabel ===
function renderTabel() {
  const tbody = document.querySelector("#tabelRiwayat tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (daftarSaran.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6'>Belum ada saran yang dipilih.</td></tr>";
    return;
  }

  daftarSaran.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.kompetensi}</td>
      <td>${item.aspek_kompetensi}</td>
      <td>${item.saran_pengembangan}</td>
      <td>${item.feedback_terakhir || "-"}</td>
      <td>
        <button class="btn-feedback" data-id="${item.saran_id}">
          ${item.feedback_terakhir ? "Edit ✏️" : "Feedback 💬"}
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

// === Modal Feedback ===
function bukaModalFeedback(saranId) {
  saranAktif = daftarSaran.find((s) => s.saran_id === saranId);
  if (!saranAktif) {
    alert("Saran tidak ditemukan!");
    return;
  }

  document.getElementById("modalJudul").textContent = saranAktif.feedback_terakhir
    ? "Edit Feedback"
    : "Berikan Feedback";

  document.getElementById("modalSaranTeks").textContent = `"${saranAktif.saran_pengembangan}"`;
  document.getElementById("inputFeedback").value = saranAktif.feedback_terakhir || "";
  document.getElementById("modalFeedback").style.display = "flex";
}

function tutupModalFeedback() {
  document.getElementById("modalFeedback").style.display = "none";
  saranAktif = null;
}

// === Kirim / Edit Feedback ===
document.getElementById("btnKirimFeedback").addEventListener("click", async () => {
  const teksFeedback = document.getElementById("inputFeedback").value.trim();
  if (!saranAktif || !teksFeedback) {
    alert("Feedback tidak boleh kosong!");
    return;
  }

  const payload = {
    saran_id: saranAktif.saran_id,
    nip,
    feedback: teksFeedback,
  };

  try {
    const method = saranAktif.feedback_terakhir ? "PUT" : "POST";
    const url =
      method === "PUT"
        ? `${feedbackUrl}/${saranAktif.saran_id}`
        : feedbackUrl;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Gagal mengirim feedback");
    alert("✅ Feedback berhasil disimpan!");

    tutupModalFeedback();
    ambilRiwayat(); // refresh tabel
  } catch (err) {
    console.error("❌ Gagal kirim feedback:", err);
    alert("Terjadi kesalahan saat menyimpan feedback.");
  }
});

document.getElementById("btnBatalFeedback").addEventListener("click", tutupModalFeedback);

// === Logout ===
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "login-pegawai.html";
}

// === Jalankan saat halaman dimuat ===
document.addEventListener("DOMContentLoaded", ambilRiwayat);