const API_BASE = "http://localhost:8000"; // atau URL Azure
async function apiLoginPegawai(nip) {
  const res = await fetch(`${API_BASE}/login?nip=${nip}`, { method: "POST" });
  return res.json();
}