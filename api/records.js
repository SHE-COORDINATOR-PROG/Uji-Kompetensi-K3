import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL belum diset di Environment Variables Vercel.' });
  }
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT
          id,
          nama,
          nrp,
          kategori_id   AS "kategoriId",
          kategori_nama AS "kategoriNama",
          to_char(tanggal, 'YYYY-MM-DD') AS tanggal,
          skor,
          lulus,
          jawaban
        FROM exam_records
        ORDER BY tanggal DESC, created_at DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { id, nama, nrp, kategoriId, kategoriNama, tanggal, skor, lulus, jawaban } = req.body || {};
      if (!id || !nama || !nrp || !kategoriId || !tanggal || skor === undefined || lulus === undefined) {
        return res.status(400).json({ error: 'Data ujian tidak lengkap.' });
      }
      const jawabanText = jawaban !== undefined ? JSON.stringify(jawaban) : null;
      await sql`
        INSERT INTO exam_records (id, nama, nrp, kategori_id, kategori_nama, tanggal, skor, lulus, jawaban)
        VALUES (${id}, ${nama}, ${nrp}, ${kategoriId}, ${kategoriNama}, ${tanggal}, ${skor}, ${lulus}, ${jawabanText})
        ON CONFLICT (id) DO NOTHING
      `;
      return res.status(201).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan server', detail: String(err.message || err) });
  }
}
