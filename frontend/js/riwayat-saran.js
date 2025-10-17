const nip =
  new URLSearchParams(window.location.search).get("nip") ||
  localStorage.getItem("pegawai_nip");

const saranUrl = `http://localhost:8000/pegawai/saran/${nip}`;
const feedbackUrl = `http://localhost:8000/feedback`;

let saranTerpilih = [];
let saranAktif = null;

// === Ambil Data Saran yang Dipilih ===
async function ambilRiwayat() {
  try {
    const res = await fetch(saranUrl);
    if (!res.ok) throw new Error("Gagal ambil data saran");
    const data = await res.json();

    const tbody = document.querySelector("#tabelRiwayat tbody");
    tbody.innerHTML = "";

    saranTerpilih = data.riwayat_saran.filter((s) => s.is_selected);

    if (saranTerpilih.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Belum ada saran yang dipilih.</td></tr>";
      return;
    }

    saranTerpilih.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.kompetensi}</td>
        <td>${item.aspek_kompetensi}</td>
        <td>${item.saran_pengembangan}</td>
        <td>${new Date(item.tanggal_rekomendasi).toLocaleDateString()}</td>
        <td>${item.feedback_terakhir || "-"}</td>
        <td>
          <button class="btn-feedback" data-id="${item.id}">
            ${item.feedback_terakhir ? "Edit ✏️" : "Berikan Feedback 💬"}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-feedback").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        bukaModalFeedback(id);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

// === Modal Feedback ===
function bukaModalFeedback(saranId) {
  saranAktif = saranTerpilih.find((s) => s.id == saranId);
  if (!saranAktif) return;

  document.getElementById("modalSaranTeks").textContent = `"${saranAktif.saran_pengembangan}"`;
  document.getElementById("inputFeedback").value = saranAktif.feedback_terakhir || "";
  document.getElementById("modalJudul").textContent =
    saranAktif.feedback_terakhir ? "Edit Feedback" : "Berikan Feedback";
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
    saran_id: saranAktif.id,
    nip: nip,
    feedback: teksFeedback,
  };

  try {
    // cek apakah feedback sudah pernah dikirim
    const method = saranAktif.feedback_terakhir ? "PUT" : "POST";
    const url = saranAktif.feedback_terakhir
      ? `${feedbackUrl}/${saranAktif.id}`
      : `${feedbackUrl}`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Gagal kirim feedback");
    alert("Feedback berhasil disimpan!");

    tutupModalFeedback();
    ambilRiwayat(); // refresh tabel
  } catch (err) {
    console.error("Gagal kirim feedback:", err);
    alert("Terjadi kesalahan saat menyimpan feedback.");
  }
});

document.getElementById("btnBatalFeedback").addEventListener("click", tutupModalFeedback);

// === Inisialisasi ===
ambilRiwayat();