// === Ambil NIP dari URL atau session ===
const nip =
  new URLSearchParams(window.location.search).get("nip") ||
  sessionStorage.getItem("nip");

const saranUrl = `http://localhost:8000/pegawai/saran/${nip}`;
const feedbackUrl = `http://localhost:8000/pegawai/feedback`;

let daftarSaran = [];
let saranAktif = null;

// === Ambil Data Riwayat (Saran + Feedback) ===
async function ambilRiwayat() {
  try {
    if (!nip) throw new Error("NIP tidak ditemukan di sesi.");

    const res = await fetch(saranUrl);
    if (!res.ok) throw new Error("Gagal mengambil data saran.");

    const data = await res.json();
    daftarSaran = Array.isArray(data)
      ? data.filter((s) => s.is_selected)
      : (data.riwayat_saran || []).filter((s) => s.is_selected);

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
      <td>${item.kompetensi || "-"}</td>
      <td>${item.aspek_kompetensi || "-"}</td>
      <td>${item.saran_pengembangan || "-"}</td>
      <td>
        ${item.feedback_terakhir || "Tidak Ada Feedback"}
        ${item.tanggal_feedback ? `<br><small>${new Date(item.tanggal_feedback).toLocaleString("id-ID")}</small>` : ""}
      </td>
      <td>
        <button class="btn-feedback" data-id="${item.saran_id || item.id}">
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
  saranAktif = daftarSaran.find((s) => s.saran_id === saranId || s.id === saranId);
  if (!saranAktif) {
    alert("Saran tidak ditemukan!");
    return;
  }

  document.getElementById("modalJudul").textContent = saranAktif.feedback_terakhir
    ? "Edit Feedback"
    : "Berikan Feedback";

  document.getElementById("modalSaranTeks").textContent =
    `"${saranAktif.saran_pengembangan}" (${saranAktif.aspek_kompetensi})`;

  const select = document.getElementById("inputFeedback");
  select.value = saranAktif.feedback_terakhir || "";

  document.getElementById("modalFeedback").style.display = "flex";
}

function tutupModalFeedback() {
  document.getElementById("modalFeedback").style.display = "none";
  saranAktif = null;
}

// === Kirim / Edit Feedback ===
document.getElementById("btnKirimFeedback").addEventListener("click", async () => {
  const select = document.getElementById("inputFeedback");
  const teksFeedback = select.value.trim();

  if (!saranAktif || !teksFeedback) {
    alert("Silakan pilih salah satu opsi feedback!");
    return;
  }

  const payload = {
    saran_id: saranAktif.saran_id || saranAktif.id,
    nip,
    feedback: teksFeedback,
  };

  try {
    const res = await fetch(feedbackUrl, {
      method: "POST", // cukup POST karena API akan handle create/update otomatis
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(errMsg || "Gagal menyimpan feedback");
    }

    const result = await res.json();
    alert(`✅ ${result.message || "Feedback berhasil disimpan!"}`);
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