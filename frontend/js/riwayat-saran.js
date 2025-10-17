const nip =
  new URLSearchParams(window.location.search).get("nip") ||
  localStorage.getItem("pegawai_nip") ||
  sessionStorage.getItem("pegawai_nip");

const saranUrl = `http://localhost:8000/pegawai/saran/${nip}`;
const feedbackUrl = `http://localhost:8000/feedback/${nip}`;

let daftarSaran = [];
let saranAktif = null;

// === Ambil data saran & feedback ===
async function ambilRiwayat() {
  try {
    const [resSaran, resFeedback] = await Promise.all([
      fetch(saranUrl),
      fetch(`${feedbackUrl}/${nip}`),
    ]);

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
    console.error("Gagal ambil data:", err);
  }
}

// === Render tabel ===
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

// === Modal ===
function bukaModalFeedback(saranId) {
  saranAktif = daftarSaran.find((s) => s.saran_id === saranId);
  if (!saranAktif) return;

  document.getElementById("modalJudul").textContent = saranAktif.feedback_terakhir
    ? "Edit Feedback"
    : "Berikan Feedback";

  document.getElementById("modalSaranTeks").textContent = `"${saranAktif.saran_pengembangan}"`;
  document.getElementById("pilihFeedback").value =
    saranAktif.feedback_terakhir || "";
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
    nip: nip,
    feedback: teksFeedback,
  };

  try {
    // Pilih method dan URL sesuai kondisi
    const method = saranAktif.feedback_terakhir ? "PUT" : "POST";
    const url =
      method === "PUT"
        ? `http://localhost:8000/feedback/${saranAktif.saran_id}`
        : `http://localhost:8000/feedback`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Gagal kirim feedback");
    alert("✅ Feedback berhasil disimpan!");

    tutupModalFeedback();
    ambilRiwayat(); // refresh tabel
  } catch (err) {
    console.error("Gagal kirim feedback:", err);
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

// === Inisialisasi ===
ambilRiwayat();