document.addEventListener("DOMContentLoaded", async () => {
  const nip = "121212"; // nanti bisa diganti dari sessionStorage atau input login
  console.log("NIP yang dikirim:", nip);

  try {
    const response = await fetch(`http://localhost:8000/pegawai/saran/${nip}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Gagal fetch data saran (${response.status})`);
    }

    const data = await response.json();
    console.log("Data saran:", data);

    const container = document.getElementById("saranContainer");
    if (!container) {
      console.error("Elemen #saranContainer tidak ditemukan di HTML!");
      return;
    }

    container.innerHTML = "";

    // ✅ Pastikan array ada dan punya isi
    if (!data.riwayat_saran || data.riwayat_saran.length === 0) {
      container.innerHTML = "<p>Tidak ada saran pengembangan ditemukan.</p>";
      return;
    }

    // 🔹 Ambil hanya 3 saran pertama
    const saranTigaPertama = data.riwayat_saran.slice(0, 3);

    saranTigaPertama.forEach((saran) => {
      const card = document.createElement("div");
      card.classList.add("saran-card");

      // tanggal direformat biar rapi
      const tanggal = new Date(saran.tanggal_rekomendasi).toLocaleDateString("id-ID");

      card.innerHTML = `
        <h3>${saran.kompetensi}</h3>
        <p><strong>Aspek:</strong> ${saran.aspek_kompetensi}</p>
        <p><strong>Saran:</strong> ${saran.saran_pengembangan}</p>
        <p><strong>Tanggal:</strong> ${tanggal}</p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data saran:", error);
    const container = document.getElementById("saranContainer");
    if (container) {
      container.innerHTML = `<p style="color:red;">Terjadi kesalahan saat memuat data saran.</p>`;
    }
  }
});