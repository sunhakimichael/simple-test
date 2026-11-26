# simple-test

Pengujian automation QA dengan **Playwright Test + TypeScript**, berisi dua bagian dalam satu repo:

| Bagian | Target | Project Playwright | Folder test |
|--------|--------|--------------------|-------------|
| **A. UI functional test** | [Sauce Demo](https://www.saucedemo.com/) | `chromium` | `tests/ui/` |
| **B. API test** | [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | `api` | `tests/api/` |

## Cara menjalankan (panduan cepat untuk non-QA)

Tidak perlu paham Playwright: cukup salin perintah di bawah ke terminal (PowerShell/CMD di Windows, Terminal di macOS/Linux). Perintahnya sama di semua OS.

### Langkah 1 kali saja

1. Install **Node.js 18 atau lebih baru** dari <https://nodejs.org> (pilih versi LTS). Cek dengan `node -v`.
2. Buka terminal di folder proyek ini, lalu jalankan:

   ```bash
   npm ci
   ```
   Memasang semua yang dibutuhkan test (dari `package-lock.json`).

   ```bash
   npx playwright install chromium
   ```
   Mengunduh browser Chromium yang dipakai test UI.

### Saya ingin…

| Saya ingin… | Ketik perintah ini |
|---|---|
| Menjalankan **semua** test | `npm test` |
| Hanya test **tampilan web** (Sauce Demo) | `npm run test:ui` |
| Hanya test **API** (Restful-Booker) | `npm run test:api` |
| Hanya test **login** | `npm run test:login` |
| Hanya test **sorting produk** | `npm run test:sorting` |
| Hanya test **checkout** (validasi form + alur beli) | `npm run test:checkout` |
| Hanya test API tertentu | `npm run test:api:booking` · `test:api:patch` · `test:api:search` · `test:api:contract` · `test:api:guard` |
| **Melihat browser** saat test berjalan | `npm run test:headed` |
| Menjalankan di **staging** / **prod** | `npm run test:staging` · `npm run test:prod` (butuh kredensial, lihat [Env](#env-devstagingprod--guard-write)) |
| Melihat daftar semua judul test | `npm run test:list` |
| Membuka **laporan hasil** terakhir | `npm run report` |

Perintah bisa digabung dengan menambahkan `--` lalu opsi tambahan. Contoh: `npm run test:login -- --headed` atau `npm run test:staging -- --project=api`.

### Menjalankan satu test spesifik

| Cara | Contoh | Hasil |
|---|---|---|
| Per **fitur/file** (cukup sebagian nama file) | `npm test -- login` | semua test di `login.spec.ts` |
| Per **judul test** (cukup sebagian kata) | `npm test -- -g "password kosong"` | tepat 1 test: *login gagal bila password kosong* |
| Per **baris** (salin dari laporan/daftar test) | `npm test -- tests/ui/login.spec.ts:37` | test yang dimulai di baris 37 |

Tidak tahu judulnya? Jalankan `npm run test:list` untuk melihat semua test beserta file dan barisnya.

### Skenario presentasi (demo)

Tiga perintah siap pakai untuk demo. Skenario 1 dan 2 membuka browser dan berjalan satu per satu (1 worker) supaya mudah diikuti penonton.

| Perintah | Isi | Jumlah test |
|---|---|---|
| `npm run demo:1` | Sorotan UI: login berhasil, user terkunci, sorting *Price (low to high)*, dan E2E login sampai konfirmasi pesanan | 4 |
| `npm run demo:2` | Seluruh test UI login, sorting produk, dan E2E checkout | 13 |
| `npm run demo:3` | API: auth dan CRUD booking (tanpa browser) | 8 |

Tips: jalankan `npm run report` setelah demo untuk menampilkan laporan HTML-nya.

### Membaca hasil

Baris pertama selalu menunjukkan env yang sedang dipakai, contoh:

```
[env] dev | UI: https://www.saucedemo.com | API: https://restful-booker.herokuapp.com | write: diizinkan
```

Di akhir run muncul ringkasan:
- **passed**: test lulus.
- **failed**: ada yang tidak sesuai harapan. Detail, screenshot, dan video tersedia di laporan (`npm run report`).
- **skipped**: sengaja tidak dijalankan, beserta alasannya. Contoh: di prod, test yang mengubah data di-skip oleh guard write. Ini memang yang diharapkan, bukan error.

### Masalah umum

| Pesan | Solusi |
|---|---|
| `'playwright' is not recognized` / `command not found` | Jalankan `npm ci` dulu. |
| `Executable doesn't exist ... chromium` | Jalankan `npx playwright install chromium`. |
| `Env var API_USERNAME wajib diisi untuk env "staging"` | Staging/prod butuh kredensial. Lihat [Env](#env-devstagingprod--guard-write). |
| `Env "produksi" tidak dikenal` | Pilihan env yang valid: `dev`, `staging`, `prod`. |

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
- **Base URL & kredensial di config/env:** URL per env ada di `config/environments.ts`, dan kredensial dibaca dari env var lewat `config/credentials.ts`. Lihat [Env Dev/Staging/Prod & guard write](#env-devstagingprod--guard-write).
- **Assertion lengkap:** status code, body (dibandingkan utuh dengan `toEqual`), dan header `content-type`.
- **Cleanup otomatis:** fixture `createBooking` mencatat setiap ID yang dibuat dan menghapusnya setelah test selesai, termasuk saat test gagal.
- **Independen & paralel:** lihat [Eksekusi paralel & isolasi](#eksekusi-paralel--isolasi).

**Perilaku Restful-Booker yang perlu diketahui** (sudah dicek langsung ke API):
- Kredensial salah dibalas **200** dengan `{"reason":"Bad credentials"}`, bukan 401.
- Payload tidak lengkap dibalas **500**, bukan 400.
- `DELETE` yang berhasil dibalas **201 Created**.
- `PATCH` ke ID yang sudah dihapus dibalas **405 Method Not Allowed**, bukan 404.

### PATCH, filter pencarian, dan contract

| Skenario | Lokasi test |
|----------|-------------|
| `PATCH` firstname saja, lastname saja, dan keduanya. Nama berubah, **field lain terbukti tidak berubah** (di respons dan lewat GET lanjutan) | `tests/api/booking-patch.spec.ts` |
| `PATCH` tanpa token: 403, data tidak berubah. `PATCH` ke booking yang sudah dihapus: 405 | `tests/api/booking-patch.spec.ts` |
| `GET /booking?firstname=`, `?firstname=&lastname=`, lastname salah menghasilkan `[]` (filter digabung AND), nama tidak ada menghasilkan `[]` | `tests/api/booking-search.spec.ts` |
| Filter setelah `PATCH` nama (nama baru ditemukan, nama lama tidak) dan setelah `DELETE` (tidak ditemukan) | `tests/api/booking-search.spec.ts` |
| Contract respons `POST /auth`, `POST /booking`, `GET /booking/{id}`, `GET /booking`, `PUT`, `PATCH` | `tests/api/booking-contract.spec.ts` |

**Cara membuktikan field lain tidak berubah:** ekspektasi dibangun dari payload asli, `{ ...sent, ...patch }`, lalu dibandingkan utuh dengan `toEqual`. Hanya key yang ada di `patch` yang boleh berbeda. Kalau `totalprice`, `depositpaid`, `bookingdates`, atau `additionalneeds` ikut berubah, test gagal. Kasusnya didefinisikan sekali di `NAME_PATCH_CASES` (`test-data/booking.ts`).

**Cara kerja contract** (`api/contracts.ts`): contract ditulis dengan asymmetric matcher Playwright (`expect.any(String)`, `expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)`, dan seterusnya), lalu dipakai lewat `toEqual`. `toEqual` menolak key yang hilang maupun key tambahan, sedangkan matcher memeriksa tipe dan format. Jadi satu assertion mencakup nama key, tipe, dan format tanggal, tanpa dependency tambahan seperti ajv atau zod. Contract memeriksa *bentuk*, sedangkan test fungsional di atas memeriksa *nilai*.

**Mengapa hasil filter bisa dibandingkan persis:** API ini publik dan dipakai banyak orang, tetapi setiap test membuat booking dengan firstname unik (`QA-<tag>`). Karena itu hasilnya bisa dicek dengan `toEqual([{ bookingid: id }])`, bukan sekadar "mengandung".

**Yang sengaja tidak diuji:** filter `checkin`/`checkout`. Di Restful-Booker filter tanggal tidak konsisten (batasnya eksklusif), jadi test-nya akan menguji bug yang sudah diketahui, bukan perilaku yang diharapkan.

**Bukti test bisa gagal:** sudah dicoba dengan mutasi sementara (tidak di-commit). Keempat mutasi gagal seperti seharusnya:
- ekspektasi `totalprice` ikut berubah setelah PATCH nama
- contract diberi key tambahan
- contract diberi tipe yang salah
- nama lama dianggap masih ditemukan setelah PATCH

## Eksekusi paralel & isolasi

`fullyParallel: true` aktif. Setiap worker Playwright adalah **proses terpisah**, jadi variabel di memori tidak pernah dibagi antar worker. Hasil audit:

| Aspek | Penerapan | Kenapa aman |
|---|---|---|
| **Fixture scope** | `authToken` scope **worker** (login sekali per worker). `bookingClient` & `createBooking` scope **test** | Token hanya string yang dibaca dan tidak pernah diubah. Semua yang punya state (daftar ID yang dibuat) dibuat baru di setiap test |
| **Shared state** | Tidak ada variabel global yang diubah antar test. Satu-satunya state modul adalah counter `uniqueTag`, yang hanya bertambah | Tidak ada test yang bergantung pada urutan atau hasil test lain |
| **Booking ID unik** | ID dibuat oleh server. Nama `QA-<waktu>-<pid>-<counter>-<acak>` dari `uniqueTag()` | pid + counter **menjamin** unik di satu mesin, dan waktu + acak memisahkan run dari mesin lain. Dibuktikan di `env-guard.spec.ts` (10.000 tag tanpa duplikat) |
| **Data orang lain** | Test hanya meng-assert ID miliknya sendiri. Hasil filter dicek persis karena namanya unik | API publik dipakai banyak orang, dan data mereka tidak memengaruhi hasil |
| **Cleanup independen** | `createBooking` hanya menghapus ID yang dibuat test itu sendiri, tetap jalan walau test gagal. Statusnya dicek (`expect.soft`, harus 201 atau 405) | Booking yang gagal dihapus akan **terlihat** di laporan beserta ID-nya, tidak bocor diam-diam |

**Dibuktikan di CI:** job `api` selalu jalan dengan `--workers=4 --repeat-each=2`, sehingga setiap test dijalankan dua kali secara paralel di setiap PR. Secara lokal juga sudah dicoba dengan `--workers=4 --repeat-each=3`.

## Env Dev/Staging/Prod & guard write

URL (tidak rahasia) dan kredensial (rahasia) **dipisah**:

| | Disimpan di | Keterangan |
|---|---|---|
| URL & aturan per env | `config/environments.ts` (di-commit) | URL staging/prod masih **placeholder**: ganti di file ini, atau override dengan `BASE_URL` / `API_BASE_URL` |
| Kredensial | env var / GitHub Secrets (**tidak** di-commit) | Daftarnya di `.env.example` |

| Env | URL default | Kredensial | Write (buat/ubah/hapus data) |
|---|---|---|---|
| `dev` (default) | saucedemo.com & restful-booker.herokuapp.com | Demo publik, otomatis | Diizinkan |
| `staging` | placeholder `*.example` | **Wajib** dari env var | Diizinkan |
| `prod` | placeholder `*.example` | **Wajib** dari env var | **Diblokir**, tidak bisa di-override |

**Menjalankan di staging/prod:** isi kredensial dulu, lalu pakai script env.

```powershell
# PowerShell (Windows)
$env:API_USERNAME="..."; $env:API_PASSWORD="..."; $env:UI_USERNAME="..."; $env:UI_PASSWORD="..."
npm run test:staging
```

```bash
# macOS / Linux
API_USERNAME=... API_PASSWORD=... UI_USERNAME=... UI_PASSWORD=... npm run test:staging
```

Kredensial dibaca saat dibutuhkan saja. Contohnya, `npm run test:staging -- --project=api` hanya meminta `API_USERNAME`/`API_PASSWORD`. Bila ada yang kurang, test gagal cepat dengan pesan yang menyebut nama variabelnya.

**Guard write dua lapis** (`config/write-guard.ts`):
1. **Lapis keras.** `BookingClient.create/update/partialUpdate/delete` dan `CheckoutOverviewPage.finishOrder()` memanggil `assertWriteAllowed()` **sebelum** request dikirim. Di prod, operasi itu langsung gagal dengan `WriteBlockedError`, jadi test yang lupa di-skip pun tetap tidak bisa mengubah data.
2. **Lapis lunak.** Test yang membuat data (lewat fixture `createBooking`) dan E2E checkout otomatis **di-skip** di prod, dengan alasan yang tampil di laporan. Yang tetap jalan di prod hanya test read-only: login, sorting, validasi form, auth, search, dan test guard.

Guard ini juga diuji tanpa jaringan di `tests/api/env-guard.spec.ts`. Di sana sebuah `APIRequestContext` palsu membuktikan bahwa di prod keempat operasi write ditolak dan **tidak ada request yang terkirim**, sementara operasi baca tetap diteruskan. Mutation check (guard dihapus dari `create`, counter `uniqueTag` tidak bertambah) membuat test ini gagal seperti seharusnya.

> Simulasi prod terhadap server publik: `TEST_ENV=prod` + `BASE_URL`/`API_BASE_URL` diarahkan ke server demo + kredensial demo lewat env var menghasilkan 34 passed dan 23 skipped: 21 test API yang membuat data, E2E checkout, dan test akun terkunci (karena `UI_LOCKED_USERNAME` tidak diset). Tidak ada data yang dibuat.

## Struktur Proyek

```
simple-test/
├── pages/                    # Page Object Model (Part A)
├── api/
│   ├── BookingClient.ts      # Pembungkus endpoint Restful-Booker (Part B)
│   └── contracts.ts          # Contract respons (key + tipe + format)
├── config/
│   ├── environments.ts       # URL & aturan write per env (dev/staging/prod)
│   ├── env.ts                # Memilih env aktif dari TEST_ENV (+ override URL)
│   ├── credentials.ts        # Kredensial dari env var (demo hanya di dev)
│   └── write-guard.ts        # Guard: blokir operasi write di prod
├── scripts/
│   └── run-tests.js          # npm run test:dev|staging|prod (lintas OS)
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
│       ├── booking.spec.ts
│       ├── booking-patch.spec.ts
│       ├── booking-search.spec.ts
│       ├── booking-contract.spec.ts
│       └── env-guard.spec.ts       # Env, kredensial, guard write, keunikan data (tanpa jaringan)
├── .env.example              # Daftar env var yang dikenali
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Catatan teknis

- Proyek ini sengaja di-*pin* ke **Playwright 1.28.1** agar bisa jalan di macOS lama. Karena itu config ditulis tanpa `defineConfig`, dan kode tidak memakai keyword `satisfies` (belum didukung Babel bawaan 1.28).
- Perintah tambahan untuk developer: `npm run test:debug` (debug langkah demi langkah) dan `npm run typecheck` (cek tipe TypeScript).

## Laporan & Debugging

- **Laporan HTML** dibuat otomatis di `playwright-report/` setiap kali test dijalankan. Buka dengan `npm run report`.
- Screenshot & video disimpan saat test UI **gagal**.
- Trace disimpan pada **retry pertama** (retry aktif di CI). Buka dengan `npx playwright show-trace <file>.zip`.

## CI (GitHub Actions)

Workflow `.github/workflows/playwright.yml` berjalan pada setiap pull request, push ke `main`, atau dijalankan manual (`workflow_dispatch`):

1. **Typecheck:** `npm run typecheck`.
2. **Test**, dua job paralel lewat matrix:
   - `chromium` (Part A): memasang Chromium, lalu menjalankan `--project=chromium` dengan 1 worker.
   - `api` (Part B): menjalankan `--project=api --workers=4 --repeat-each=2` tanpa memasang browser, untuk membuktikan isolasi paralel.
3. **Laporan HTML** tiap project diunggah sebagai artifact `playwright-report-<project>`. Bila ada yang gagal, `test-results/` (trace, screenshot, video) juga diunggah.

**Memilih env di CI:** push dan PR selalu memakai `dev`. Untuk staging/prod, buka tab **Actions → Playwright Tests → Run workflow**, lalu pilih `environment`. Kredensial diambil dari **GitHub Secrets** (`API_USERNAME`, `API_PASSWORD`, `UI_USERNAME`, `UI_PASSWORD`, `UI_LOCKED_USERNAME`).

Runner memakai **Ubuntu 22.04** karena Playwright 1.28 belum mendukung dependensi browser di Ubuntu 24.04. Di CI, test otomatis di-retry 2x.

## Catatan

- Sauce Demo dan Restful-Booker adalah layanan demo publik yang dipakai banyak orang, jadi perilakunya bisa berubah atau sesekali lambat.
- Kredensial demo di `config/credentials.ts` adalah kredensial publik dari situs masing-masing, bukan rahasia, dan hanya dipakai di env `dev`.
