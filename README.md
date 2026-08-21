# SIGAP K3 — Deploy ke GitHub + Vercel + Neon

Struktur project:
```
sigap-k3-deploy/
├── index.html          ← dashboard (frontend, statis)
├── api/records.js       ← serverless function (baca/tulis hasil ujian)
├── schema.sql            ← skema tabel database
├── package.json
├── vercel.json
└── .gitignore
```

Frontend awalnya memakai `window.storage`, yang **hanya berjalan di dalam Claude.ai artifact** dan
tidak akan berfungsi jika di-hosting sendiri. Versi di folder ini sudah diganti agar memanggil
`/api/records` (serverless function) yang tersambung ke database Neon Postgres — sehingga data
ujian benar-benar tersimpan permanen dan bisa diakses semua pengguna dari mana saja.

---

## 1. Buat database di Neon

1. Buka https://neon.tech → daftar/masuk (bisa pakai akun GitHub).
2. **Create a project** → beri nama misalnya `sigap-k3`, pilih region terdekat (mis. Singapore).
3. Setelah project dibuat, buka tab **SQL Editor** di dashboard Neon.
4. Tempel isi file `schema.sql` lalu jalankan (klik **Run**). Ini membuat tabel `exam_records`.
5. Buka **Connection Details** / **Dashboard → Connection string**, salin string yang formatnya:
   ```
   postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
   ```
   Simpan ini — dipakai sebagai `DATABASE_URL` di langkah Vercel nanti.

---

## 2. Push project ke GitHub

Dari terminal, di dalam folder `sigap-k3-deploy`:

```bash
git init
git add .
git commit -m "Initial commit: dashboard training & ujian K3"
```

Buat repository baru di https://github.com/new (misalnya `sigap-k3-dashboard`), **jangan** centang
"Initialize with README" (karena sudah ada file lokal), lalu:

```bash
git branch -M main
git remote add origin https://github.com/<username-anda>/sigap-k3-dashboard.git
git push -u origin main
```

---

## 3. Deploy ke Vercel

1. Buka https://vercel.com → masuk dengan akun GitHub.
2. **Add New → Project**, pilih repository `sigap-k3-dashboard` yang baru di-push.
3. Framework Preset: pilih **Other** (tidak perlu build command khusus — ini static HTML + serverless function, Vercel akan mendeteksi `api/records.js` secara otomatis).
4. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string Neon dari langkah 1 |
5. Klik **Deploy**. Setelah selesai (biasanya < 1 menit), Vercel memberi URL publik seperti:
   ```
   https://sigap-k3-dashboard.vercel.app
   ```
6. Buka URL tersebut → dashboard sudah live. Coba isi satu ujian untuk memastikan data masuk ke Neon
   (cek lagi di **SQL Editor** Neon: `SELECT * FROM exam_records;`).

Setiap kali Anda `git push` perubahan baru ke branch `main`, Vercel otomatis build & deploy ulang.

---

## 4. (Opsional) Custom domain

Di project Vercel → tab **Settings → Domains** → tambahkan domain milik Anda (mis. `k3.perusahaan.com`),
lalu arahkan DNS sesuai instruksi yang ditampilkan Vercel (biasanya CNAME).

---

## Catatan penting

- **Data bersifat bersama (shared)** — semua peserta yang membuka link akan menulis ke tabel database
  yang sama. Tidak ada login/otentikasi di versi ini; siapa pun dengan link bisa mengisi ujian dan
  melihat dashboard. Tambahkan proteksi (mis. Vercel Password Protection di plan Pro, atau login
  sederhana) jika perlu dibatasi.
- Tombol **Export ke PPT** tetap berjalan sepenuhnya di browser (memakai PptxGenJS dari CDN), tidak
  butuh perubahan apa pun untuk deploy.
- Link ujian per kategori (`.../#ujian/hand-finger`, dst.) otomatis mengikuti domain Vercel Anda begitu
  sudah live — tombol "Salin" di menu Soal akan menghasilkan link yang benar.
- Jika ingin reset seluruh data ujian, jalankan `TRUNCATE TABLE exam_records;` di SQL Editor Neon.
