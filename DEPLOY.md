# Panduan Hosting Gratis Online (Node.js + SQLite) — Nu Fried Chicken & Burger

Website ini menggunakan **SQLite built-in (`node:sqlite`)** tanpa dependency eksternal sehingga tidak perlu setup server database MySQL terpisah.

---

## Langkah 1: Upload Project ke GitHub
1. Buat repository baru di **https://github.com/new** (misal: `nu-fried-chicken-web`).
2. Upload seluruh isi folder `d:\Project\Webnu\` (kecuali `node_modules/`, `data/`, `.env`, dan file referensi `Dkriuk*` yang sudah dikecualikan di `.gitignore`).

---

## Langkah 2: Deploy Gratis ke Render.com (atau Railway)
1. Daftar / login di **https://render.com/** menggunakan akun GitHub Anda.
2. Klik **New +** → **Web Service** → pilih repository `nu-fried-chicken-web`.
3. Karena sudah tersedia `render.yaml`, pengaturan otomatis terisi:
   - **Runtime:** Node (`>=22.5.0`)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Health Check Path:** `/api/health`
   - **Instance Type:** **Free**
4. Klik **Create Web Service**. Tunggu ± 1–2 menit hingga status **Live**.
5. Buka URL `https://nama-app-anda.onrender.com`:
   - Halaman utama: `/`
   - Login Admin: `/admin.html` (default: `admin` / `nuchicken2026` — segera ganti password di tab **Keamanan & Reset**).

> **Catatan Penyimpanan Online:** File database SQLite otomatis dibuat di `data/webnu.sqlite`. Pada paket Free Render, disk lokal bersifat sementara (reset saat *redeploy*). Jika ingin data SQLite & gambar upload permanen 100% saat redeploy, pasang **Volume/Disk** di Railway atau Render Disk, dan gunakan URL gambar eksternal pada Admin Panel.
