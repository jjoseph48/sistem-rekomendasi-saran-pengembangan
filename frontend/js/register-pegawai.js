document.addEventListener("DOMContentLoaded", () => {
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const btnLanjut1 = document.getElementById("btnLanjut1");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnBatal = document.getElementById("btnBatal");
  const btnKembali = document.getElementById("btnKembali");
  const messageBox = document.getElementById("messageBox");

  const daftarKompetensi = [
    "Integritas",
    "Kerjasama",
    "Komunikasi",
    "Orientasi pada Hasil",
    "Pelayanan Publik",
    "Pengambilan Keputusan",
    "Mengelola Perubahan",
    "Pengembangan Diri dan Orang Lain",
    "Perekat Bangsa",
  ];

  // === Step 1 -> Step 2 ===
  btnLanjut1.addEventListener("click", () => {
    const nama = document.getElementById("nama").value.trim();
    const nip = document.getElementById("nip").value.trim();

    if (!nama || !nip) {
      showMessage("⚠️ Nama dan NIP wajib diisi!", "error");
      return;
    }

    clearMessage();
    step1.classList.remove("active");
    step2.classList.add("active");
    btnKembali.style.display = "inline-block";
    generateKompetensiForm();
  });

  // === Tombol Kembali ===
  btnKembali.addEventListener("click", () => {
    clearMessage();
    step2.classList.remove("active");
    step1.classList.add("active");
    btnKembali.style.display = "none";
  });

  // === Tombol Batalkan ===
  btnBatal.addEventListener("click", () => {
    if (confirm("Batalkan registrasi dan kembali ke halaman login?")) {
      window.location.href = "login-pegawai.html";
    }
  });

  // === Generate Form Kompetensi ===
  function generateKompetensiForm() {
    const container = document.getElementById("kompetensiContainer");
    container.innerHTML = "";
    daftarKompetensi.forEach((nama) => {
      const div = document.createElement("div");
      div.classList.add("kompetensi-card");
      div.innerHTML = `
        <h3>${nama}</h3>
        <label>Standar level</label>
        <input type="number" class="input-standar" min="1" max="5" value="3" />
        <label>Capaian nilai</label>
        <input type="number" class="input-capaian" min="0" max="6" value="3" />
        <label>Gap</label>
        <input type="number" class="input-gap" step="0.25" value="0" />
      `;
      container.appendChild(div);
    });
  }

  // === Submit Registrasi ===
  btnSubmit.addEventListener("click", async () => {
    clearMessage();

    const data = {
      nama: document.getElementById("nama").value.trim(),
      nip: document.getElementById("nip").value.trim(),
      satker: document.getElementById("satker").value.trim(),
      jabatan: document.getElementById("jabatan").value.trim(),
      kinerja: document.getElementById("kinerja").value.trim(),
      kompetensi: [],
    };

    if (!data.nama || !data.nip) {
      showMessage("⚠️ Nama dan NIP wajib diisi sebelum submit.", "error");
      return;
    }

    // Ambil data kompetensi
    document.querySelectorAll(".kompetensi-card").forEach((card, i) => {
      const nama_kompetensi = daftarKompetensi[i];
      const standar_level = parseFloat(card.querySelector(".input-standar").value) || 0;
      const capaian_nilai = parseFloat(card.querySelector(".input-capaian").value) || 0;
      const gap_kompetensi = parseFloat(card.querySelector(".input-gap").value) || 0;

      data.kompetensi.push({
        nama_kompetensi,
        standar_level,
        capaian_nilai,
        gap_kompetensi,
      });
    });

    try {
      const res = await fetch("api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        showMessage(
          result.detail || "❌ Gagal melakukan registrasi. Pastikan data sudah benar.",
          "error"
        );
        return;
      }

      showMessage("✅ Registrasi berhasil! Mengarahkan ke halaman login...", "success");

      setTimeout(() => {
        window.location.href = "login-pegawai.html";
      }, 1500);
    } catch (err) {
      console.error(err);
      showMessage("❌ Tidak dapat terhubung ke server.", "error");
    }
  });

  // === Helper Message ===
  function showMessage(msg, type = "info") {
    messageBox.textContent = msg;
    messageBox.className = type;
  }

  function clearMessage() {
    messageBox.textContent = "";
    messageBox.className = "";
  }
});