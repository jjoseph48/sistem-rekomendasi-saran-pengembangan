document.getElementById("btnLogin").addEventListener("click", async () => {
  const nip = document.getElementById('nip').value.trim();

  if (!nip) {
    alert("Harap masukkan NIP terlebih dahulu.");
    return;
  }

  try {
    const response = await fetch(`api/login?nip=${nip}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip }),
  });


    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('nip', data.nip);
      sessionStorage.setItem('nama', data.nama);

      // Tunggu penyimpanan selesai (dalam microtask berikutnya)
      setTimeout(() => {
          window.location.href = "dashboard-pegawai.html";
      }, 100);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Terjadi kesalahan koneksi ke server.");
  }
});