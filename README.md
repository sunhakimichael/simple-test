# simple-test

Pengujian automation QA dengan **Playwright Test + TypeScript**, berisi dua bagian dalam satu repo:

| Bagian | Target | Project Playwright | Folder test |
|--------|--------|--------------------|-------------|
| **A. UI functional test** | [Sauce Demo](https://www.saucedemo.com/) | `chromium` | `tests/ui/` |
| **B. API test** | [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | `api` | `tests/api/` |

## Part A: UI test (Sauce Demo)

Memakai **Page Object Model**: locator dan assertion halaman ada di `pages/`, spec hanya berisi alur bisnis.

| Skenario soal | Lokasi test |
|---------------|-------------|
| 1. Login valid masuk ke halaman produk | `tests/ui/login.spec.ts` › *login berhasil dengan kredensial valid lalu logout* |
| 2. `locked_out_user` menampilkan pesan error yang benar | `tests/ui/login.spec.ts` › *login gagal untuk user yang terkunci* |
| 3. Sort "Price (low to high)": **seluruh** daftar berurutan | `tests/ui/product-sorting.spec.ts` (diperluas ke 4 opsi sort, lihat [Multi-sorting](#multi-sorting)) |
| 4. Tambah 2 produk, cek badge & isi cart, checkout sampai konfirmasi | `tests/ui/e2e/checkout-journey.spec.ts` |

Test tambahan: kredensial salah, username/password kosong, akses `/inventory.html` tanpa login, dan validasi form checkout (`tests/ui/checkout-form-validation.spec.ts`, lihat [Negative test form checkout](#negative-test-form-checkout)).

**Cara memenuhi syarat teknis:**
- **Locator user-facing:** `getByTestId` (dikonfigurasi ke atribut `data-test` milik Sauce Demo) dan `getByRole`. Tidak ada XPath atau rantai CSS.
- **Tanpa hard-coded wait:** tidak ada `waitForTimeout`. Semua menunggu lewat auto-wait locator dan web-first assertion (`toHaveText`, `toHaveCount`, ...).
- **Data terpisah dari body test:** user, produk, opsi sort, data customer, dan teks yang diharapkan ada di `test-data/`.
- **Sorting dicek menyeluruh:** seluruh daftar (jumlah, nama, harga per posisi) dibandingkan dengan urutan yang dihitung dari katalog, bukan hanya item pertama.
- **Total checkout dihitung**, bukan ditulis manual: `calculateOrderTotals()` menghitung subtotal + pajak 8% dalam satuan sen.

> Sauce Demo tidak punya form kartu kredit. "Payment" diverifikasi lewat info pembayaran statis (`SauceCard #31337`), rincian harga, lalu tombol **Finish**.

### Negative test form checkout

`tests/ui/checkout-form-validation.spec.ts` menjalankan satu skenario reusable untuk setiap field wajib di `REQUIRED_FIELD_CASES` (`test-data/checkout.ts`): **First Name**, **Last Name**, dan **Postal Code**. Pada tiap kasus, field tersebut tidak diisi sama sekali, dan dua field lainnya diisi dengan data `CUSTOMER`.

Setiap test memiliki 4 langkah (`test.step`):

1. Isi form tanpa field tersebut, lalu klik **Continue**.
2. **Checkout terblokir**, dicek dengan `checkoutInfoPage.expectCheckoutBlocked()`:
   - pesan error yang tepat tampil (mis. `Error: Last Name is required`),
   - user tetap di Checkout Step One (URL `checkout-step-one.html`, judul, tombol Continue masih ada),
   - field yang kosong tetap kosong, dan isian lain tidak hilang,
   - badge keranjang tidak berubah (pesanan belum dibuat).
3. Klik **Continue** lagi tanpa perbaikan: tetap ditolak.
4. **Kontrol:** setelah field diisi, checkout baru berlanjut ke Overview dengan item yang sama. Langkah ini membuktikan bahwa penyebab blokirnya memang field tersebut.

Ada juga kasus **semua field kosong**: error First Name tampil lebih dulu, dan checkout tidak berlanjut.

> Sauce Demo memberi tanda merah dan ikon ✕ di **ketiga** field setiap kali validasi gagal, tidak hanya di field yang kosong. Karena itu, field yang bermasalah dipastikan lewat teks error, bukan lewat tanda visual tersebut.

**Bukti test bisa gagal:** spec ini pernah dijalankan sebagai user Sauce Demo yang memang punya bug di form checkout.
- `problem_user`: ketikan di Last Name masuk ke field lain. Test menangkap pesan error yang salah, dan menangkap checkout yang tetap macet setelah field diperbaiki.
- `error_user`: field Last Name tidak bisa diisi, dan checkout **lolos tanpa Last Name**. Test menangkap isian yang hilang dan error yang tidak muncul.

### Multi-sorting

`tests/ui/product-sorting.spec.ts` menjalankan **satu skenario reusable** untuk setiap opsi di `SORT_OPTIONS`:

| Opsi | `value` | Aturan expected |
|------|---------|-----------------|
| Name (A to Z) | `az` | Nama naik (`localeCompare`) |
| Name (Z to A) | `za` | Nama turun |
| Price (low to high) | `lohi` | Harga naik; harga sama → Name A–Z |
| Price (high to low) | `hilo` | Harga turun; harga sama → Name A–Z |

Ada juga test urutan default saat halaman dibuka (Name A–Z), dan test yang mengganti keempat sort berturut-turut di halaman yang sama. Total: 6 test.

**Menambah opsi sort baru** cukup dengan satu entri di `SORT_OPTIONS` (`value`, `label`, `compare`). Test-nya terbentuk otomatis lewat loop.

#### Sumber expected data

Expected order **tidak pernah dibaca dari UI**. Kalau dibaca dari UI, test hanya membandingkan halaman dengan dirinya sendiri dan tidak akan menangkap produk yang hilang, ganda, atau harganya salah. Expected order disusun dari dua bagian di `test-data/products.ts`:

1. **`CATALOG`: data apa (nama & harga).** Ini snapshot keenam produk yang tampil di `/inventory.html` untuk `standard_user`, dicatat dari situsnya langsung (26 Nov 2026). Sengaja ditulis tidak berurutan, supaya urutan yang diharapkan benar-benar hasil aturan sort, bukan kebetulan cocok dengan urutan penulisan.
2. **`compare` di tiap `SORT_OPTIONS`: aturan urutannya.** Diturunkan dari label opsinya (A–Z, Z–A, low–high, high–low).

`expectedOrder(option)` lalu menghasilkan `[...CATALOG].sort(option.compare)`. Hasilnya dicocokkan dengan halaman lewat `inventoryPage.expectProductsInOrder()`, yaitu `toHaveText([...])` untuk nama dan harga. Assertion ini web-first (auto-retry), jadi tidak perlu wait manual.

**Aturan harga kembar.** Bolt T-Shirt dan Test.allTheThings() T-Shirt sama-sama $15.99. Label opsi sort tidak menjelaskan urutan untuk kasus ini. Dari pengamatan langsung di situs, Sauce Demo memakai sort stabil dari urutan default, sehingga produk berharga sama tetap Name A–Z di **kedua** arah harga. Aturan ini dicatat eksplisit di `byPrice()`. Kalau Sauce Labs mengubah perilakunya, test akan gagal tepat di posisi kedua T-Shirt tersebut.

**Bukti test bisa gagal** (dicoba saat menulis test):
- Saat dijalankan sebagai `problem_user` (fitur sort-nya rusak), 4 dari 6 test gagal: dropdown tetap `az`.
- Saat aturan tie-breaker high–low sengaja dibalik, test gagal di posisi T-Shirt $15.99.

## Part B: API test (Restful-Booker)

Memakai fixture `request` bawaan Playwright (`APIRequestContext`) dan berjalan sebagai **project terpisah** bernama `api` (tanpa browser).

| Skenario soal | Lokasi test |
|---------------|-------------|
| 1. `POST /auth` mengembalikan token, diambil **sekali** | Fixture `authToken` (scope `worker`) di `fixtures/api.fixture.ts`, plus test `tests/api/auth.spec.ts` |
| 2. `POST /booking`: status, ID, dan setiap field sama dengan yang dikirim | `tests/api/booking.spec.ts` |
| 3. `GET /booking/{id}` mengembalikan booking yang sama | `tests/api/booking.spec.ts` |
| 4. `PUT /booking/{id}` dengan token mengubah setiap field, dicek lewat GET lanjutan | `tests/api/booking.spec.ts` |
| 5. Test negatif | Kredensial salah, `PUT` tanpa token (403, data tidak berubah), payload tidak lengkap (500) |

Ada juga test `DELETE /booking/{id}` (201, lalu `GET` berikutnya 404).

**Cara memenuhi syarat teknis:**
- **Base URL & kredensial di config/env:** `config/api.config.ts` membaca `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`. Defaultnya kredensial admin publik dari dokumentasi Restful-Booker.
- **Assertion lengkap:** status code, body (dibandingkan utuh dengan `toEqual`), dan header `content-type`.
- **Cleanup otomatis:** fixture `createBooking` mencatat setiap ID yang dibuat dan menghapusnya setelah test selesai, termasuk saat test gagal.
- **Independen & paralel:** setiap test membuat booking-nya sendiri dengan nama unik dan tidak pernah memakai ID yang sudah ada. Sudah dicoba dengan `--repeat-each=3 --workers=6`.

**Perilaku Restful-Booker yang perlu diketahui** (sudah dicek langsung ke API):
- Kredensial salah dibalas **200** dengan `{"reason":"Bad credentials"}`, bukan 401.
- Payload tidak lengkap dibalas **500**, bukan 400.
- `DELETE` yang berhasil dibalas **201 Created**.

## Struktur Proyek

```
simple-test/
├── pages/                    # Page Object Model (Part A)
├── api/
│   └── BookingClient.ts      # Pembungkus endpoint Restful-Booker (Part B)
├── config/
│   └── api.config.ts         # Base URL & kredensial API (bisa di-override env)
├── fixtures/
│   ├── pages.fixture.ts      # Menyuntikkan Page Object ke test UI
│   └── api.fixture.ts        # authToken (per worker), bookingClient, createBooking + cleanup
├── test-data/
│   ├── users.ts              # Kredensial Sauce Demo
│   ├── products.ts           # Produk, jumlah inventory, opsi sort
│   ├── checkout.ts           # Data customer, teks & pesan error yang diharapkan
│   ├── order-calculator.ts   # Hitung subtotal, pajak 8%, total
│   └── booking.ts            # Pembuat data booking unik & pesan API
├── tests/
│   ├── ui/                   # Project "chromium"
│   │   ├── e2e/checkout-journey.spec.ts
│   │   ├── login.spec.ts
│   │   ├── product-sorting.spec.ts
│   │   └── checkout-form-validation.spec.ts
│   └── api/                  # Project "api"
│       ├── auth.spec.ts
│       └── booking.spec.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Prasyarat & Instalasi

Proyek ini sengaja di-*pin* ke **Playwright 1.28.1** agar bisa jalan di macOS lama. Karena itu config ditulis tanpa `defineConfig`, dan kode tidak memakai keyword `satisfies` (belum didukung Babel bawaan 1.28).

```bash
git clone https://github.com/sunhakimichael/simple-test.git
cd simple-test
npm ci
npx playwright install chromium   # hanya dibutuhkan untuk Part A
```

## Menjalankan Test

```bash
npm test                  # Part A + Part B
npm run test:ui           # hanya Part A (project chromium)
npm run test:api          # hanya Part B (project api)
npm run test:e2e          # hanya E2E checkout
npm run test:headed       # browser terlihat
npm run test:debug        # debug step-by-step
npm run report            # buka laporan HTML terakhir
npm run typecheck         # cek tipe TypeScript
```

Override target lewat environment variable (opsional):

```bash
BASE_URL=https://www.saucedemo.com npm run test:ui
API_BASE_URL=https://restful-booker.herokuapp.com API_USERNAME=admin API_PASSWORD=password123 npm run test:api
```

## Laporan & Debugging

- **Laporan HTML** dibuat otomatis di `playwright-report/` setiap kali test dijalankan. Buka dengan `npm run report`.
- Screenshot & video disimpan saat test UI **gagal**.
- Trace disimpan pada **retry pertama** (retry aktif di CI). Buka dengan `npx playwright show-trace <file>.zip`.

## CI (GitHub Actions)

Workflow `.github/workflows/playwright.yml` berjalan pada setiap pull request, push ke `main`, atau dijalankan manual (`workflow_dispatch`):

1. **Typecheck:** `npm run typecheck`.
2. **Test**, dua job paralel lewat matrix:
   - `chromium` (Part A): memasang Chromium, lalu menjalankan `--project=chromium`.
   - `api` (Part B): menjalankan `--project=api` tanpa memasang browser.
3. **Laporan HTML** tiap project diunggah sebagai artifact `playwright-report-<project>`. Bila ada yang gagal, `test-results/` (trace, screenshot, video) juga diunggah.

Runner memakai **Ubuntu 22.04** karena Playwright 1.28 belum mendukung dependensi browser di Ubuntu 24.04. Di CI, test otomatis di-retry 2x dan berjalan dengan 1 worker (lihat `playwright.config.ts`).

## Catatan

- Sauce Demo dan Restful-Booker adalah layanan demo publik yang dipakai banyak orang, jadi perilakunya bisa berubah atau sesekali lambat.
- Kredensial di repo ini adalah kredensial publik dari situs masing-masing, bukan rahasia.
