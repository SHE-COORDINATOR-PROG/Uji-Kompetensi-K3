CREATE TABLE IF NOT EXISTS exam_records (
  id            TEXT PRIMARY KEY,
  nama          TEXT NOT NULL,
  nrp           TEXT NOT NULL,
  kategori_id   TEXT NOT NULL,
  kategori_nama TEXT NOT NULL,
  tanggal       DATE NOT NULL,
  skor          INTEGER NOT NULL CHECK (skor BETWEEN 0 AND 100),
  lulus         BOOLEAN NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_records_kategori ON exam_records (kategori_id);
CREATE INDEX IF NOT EXISTS idx_exam_records_tanggal ON exam_records (tanggal);
CREATE INDEX IF NOT EXISTS idx_exam_records_peserta ON exam_records (nama, nrp);
