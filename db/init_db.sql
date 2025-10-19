-- =====================================
--  INIT DB SCRIPT: LATSAR SYSTEM (FINAL UPDATED)
-- =====================================

-- 🧱 Tabel pegawai
CREATE TABLE IF NOT EXISTS pegawai (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    nip VARCHAR(50) UNIQUE NOT NULL,
    satker VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255) NOT NULL,
    kinerja VARCHAR(100) NOT NULL
);

-- 🧱 Tabel kompetensi_pegawai
CREATE TABLE IF NOT EXISTS kompetensi_pegawai (
    id SERIAL PRIMARY KEY,
    pegawai_id INTEGER REFERENCES pegawai(id) ON DELETE CASCADE,
    nama_kompetensi VARCHAR(255) NOT NULL,
    standar_level FLOAT NOT NULL,
    capaian_nilai FLOAT NOT NULL,
    gap_kompetensi FLOAT NOT NULL
);

-- 🧱 Tabel feedback (baru)
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    feedback VARCHAR(255) NOT NULL
);

-- 🧱 Tabel saran_pengembangan
CREATE TABLE IF NOT EXISTS saran_pengembangan (
    id SERIAL PRIMARY KEY,
    pegawai_id INTEGER REFERENCES pegawai(id) ON DELETE CASCADE,
    kompetensi VARCHAR(255) NOT NULL,
    aspek_kompetensi VARCHAR(100) NOT NULL,
    saran_pengembangan TEXT NOT NULL,
    feedback_id INTEGER REFERENCES feedback(id) ON DELETE SET NULL,
    tanggal_rekomendasi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🧱 Tabel user_admin
CREATE TABLE IF NOT EXISTS user_admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'superadmin')) NOT NULL
);

-- ⚡ Indexing untuk performa
CREATE INDEX IF NOT EXISTS idx_pegawai_nip ON pegawai(nip);
CREATE INDEX IF NOT EXISTS idx_saran_pegawai_id ON saran_pengembangan(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_kompetensi_pegawai_id ON kompetensi_pegawai(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_feedback_text ON feedback(feedback);

-- 🧩 Insert superadmin default
INSERT INTO user_admin (username, password, role)
VALUES ('superadmin', 'super123', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 🧩 Insert admin tambahan
INSERT INTO user_admin (username, password, role)
VALUES ('admin1', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- =====================================
-- END OF INIT SCRIPT
-- =====================================