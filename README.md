# simple-test

Pengujian automation QA sederhana dengan **Playwright + TypeScript** menggunakan desain **Page Object Model (POM)**.

Aplikasi yang diuji: [Sauce Demo](https://www.saucedemo.com/), situs e-commerce demo yang disediakan Sauce Labs untuk latihan automation.

## Cakupan Test

### E2E utama: `tests/e2e/checkout-journey.spec.ts`

Satu user journey lengkap, dibagi per `test.step` agar laporan mudah dibaca:

| # | Tahap | Assertion utama |
|---|-------|-----------------|
| 1 | **User Login** | Form login tampil, redirect ke `/inventory.html`, judul "Products", 6 produk tampil, badge keranjang kosong |
| 2 | **Product Checkout** | Nama & harga produk benar, tombol berubah menjadi "Remove", badge keranjang sesuai jumlah, isi halaman cart sama persis (nama, harga, qty) |
| 3 | **Form Submission** (Shipping/Billing) | Form awal kosong, field terisi sesuai input, submit berpindah ke `checkout-step-two` |
| 4 | **Payment Completion** | Item di overview sesuai, info pembayaran (`SauceCard #31337`), info pengiriman, **subtotal + pajak 8% + total** sesuai perhitungan, klik Finish |
| 5 | **Konfirmasi akhir** | URL `/checkout-complete.html`, judul, header "Thank you for your order!", teks konfirmasi, gambar tampil, keranjang kosong setelah kembali ke produk |

### Test pendukung

- `tests/login.spec.ts`: login valid + logout, kredensial salah, user terkunci, username/password kosong, akses langsung tanpa login.
- `tests/checkout-form-validation.spec.ts`: validasi First Name / Last Name / Postal Code kosong, dan tombol Cancel.

> **Catatan tentang "Billing" dan "Payment":** Sauce Demo hanya memiliki satu form data diri (First Name, Last Name, Postal Code) yang berfungsi sebagai data shipping/billing. Aplikasi ini **tidak memiliki form kartu kredit**; info pembayaran berupa teks statis `SauceCard #31337` di halaman overview. Karena itu, "Payment Completion" diuji dengan memverifikasi info pembayaran tersebut, rincian harga, lalu menyelesaikan order dengan tombol **Finish**.

## Struktur Proyek

```
simple-test/
├── pages/                          # Page Object Model
│   ├── BasePage.ts                 # Kelas dasar (assertion URL halaman)
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutInformationPage.ts  # Checkout step 1 (form data diri)
│   ├── CheckoutOverviewPage.ts     # Checkout step 2 (review & pembayaran)
│   ├── CheckoutCompletePage.ts     # Halaman konfirmasi
│   └── index.ts
├── fixtures/
│   └── pages.fixture.ts            # Menyuntikkan Page Object ke setiap test
├── test-data/
│   ├── users.ts                    # Kredensial
│   ├── products.ts                 # Nama & harga produk
│   ├── checkout.ts                 # Data customer, teks & pesan error yang diharapkan
│   └── order-calculator.ts         # Hitung subtotal, pajak 8%, total
├── tests/
│   ├── e2e/checkout-journey.spec.ts
│   ├── login.spec.ts
│   └── checkout-form-validation.spec.ts
├── .github/workflows/playwright.yml  # CI GitHub Actions
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

### Prinsip desain POM yang dipakai

- **Locator hanya ada di Page Object.** File spec tidak berisi selector, sehingga bila UI berubah, cukup perbaiki satu tempat.
- **Assertion dikelompokkan sebagai method `expect...()`** di Page Object (mis. `expectTotals()`), sehingga spec tetap ringkas dan terbaca seperti alur bisnis.
- **Data terpisah dari logic.** Kredensial, produk, dan teks harapan ada di `test-data/`.
- **Fixture** menyediakan Page Object siap pakai di setiap test.
- **Locator** memakai `getByTestId` (dikonfigurasi ke atribut `data-test`) dan `getByRole`, bukan CSS/XPath yang rapuh.
- Total harga **dihitung** oleh `calculateOrderTotals()`, bukan ditulis manual, sehingga assertion tetap valid walau produk yang dipilih berubah.

## Prasyarat

- [Node.js](https://nodejs.org/) yang bisa berjalan di OS-mu (proyek ini tidak mewajibkan Node 18+)
- npm

### Kompatibilitas versi (macOS lama)

Proyek ini sengaja di-*pin* ke **Playwright 1.28.1** dan TypeScript 5.4 agar bisa dipakai di macOS lama (mis. 10.13 High Sierra). Playwright versi terbaru secara resmi membutuhkan Node.js 18+ dan macOS yang jauh lebih baru.

- `playwright.config.ts` ditulis **tanpa `defineConfig`** (baru ada sejak Playwright 1.31).
- Secara default hanya project **Chromium** yang aktif. Firefox dan WebKit ada di config dalam bentuk komentar; aktifkan hanya bila OS dan versi Playwright-mu mendukung.
- Bila OS-mu modern, kamu bebas upgrade: `npm install -D @playwright/test@latest`. Kode proyek tetap kompatibel.

## Instalasi

```bash
git clone https://github.com/sunhakimichael/simple-test.git
cd simple-test
npm install
npx playwright install chromium   # unduh browser Chromium
```

## Menjalankan Test

```bash
npm test                  # semua test pada project yang aktif (headless)
npm run test:chromium     # hanya Chromium
npm run test:e2e          # hanya user journey E2E
npm run test:headed       # browser terlihat

npm run test:debug        # debug step-by-step
npm run report            # buka laporan HTML terakhir
npm run typecheck         # cek tipe TypeScript
```

Menjalankan satu file atau satu test:

```bash
npx playwright test tests/e2e/checkout-journey.spec.ts --project=chromium --headed
npx playwright test -g "login gagal"
```

Mengubah URL target (opsional):

```bash
BASE_URL=https://www.saucedemo.com npm test
```

## Hasil & Debugging

- Laporan HTML: `playwright-report/` (buka dengan `npm run report`)
- Screenshot & video otomatis disimpan saat test **gagal**
- Trace disimpan pada **retry pertama** di CI. Buka dengan `npx playwright show-trace <file>.zip`

## CI

Workflow GitHub Actions di `.github/workflows/playwright.yml` otomatis menjalankan typecheck dan seluruh test setiap `push` / `pull request`, lalu mengunggah laporan HTML sebagai artifact.

## Menambah Test Baru

1. Tambahkan locator/method baru di Page Object yang relevan (atau buat kelas baru turunan `BasePage`).
2. Daftarkan di `pages/index.ts` dan `fixtures/pages.fixture.ts` bila halaman baru.
3. Tulis spec di folder `tests/` dengan `import { test, expect } from '../fixtures/pages.fixture'`.

## Catatan

- UI mode (`--ui`) baru tersedia di Playwright 1.32+, jadi tidak bisa dipakai pada versi 1.28.1. Gunakan `npm run test:headed` atau `npm run test:debug`.
- Sauce Demo adalah situs demo publik, jadi perilakunya bisa berubah sewaktu-waktu. Bila ada test yang gagal setelah update dari Sauce Labs, cek locator di folder `pages/` terlebih dahulu.
- Kredensial di `test-data/users.ts` adalah kredensial publik dari halaman login Sauce Demo, bukan rahasia.
