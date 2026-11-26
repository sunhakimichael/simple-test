# Knowledge Base `simple-test`

Kumpulan penjelasan *kenapa* dan *bagaimana* repo ini dibangun. README utama menjawab "cara menjalankan". KB ini menjawab "cara kerjanya" dan berguna untuk onboarding, review, presentasi, atau persiapan wawancara.

## Daftar artikel

| Topik | Artikel | Isi singkat |
|---|---|---|
| UI (Part A) | [Page Object Model](ui/page-object-model.md) | Tiga lapisan Spec → Fixture → Page Object, daftar Page Object, contoh alur checkout, cara menambah halaman |

## Topik yang dibahas di README utama

Topik berikut sudah dijelaskan lengkap di [README](../README.md), jadi tidak diulang di sini:

| Topik | Bagian README |
|---|---|
| Cara menjalankan test (non-QA) dan skenario demo | [Cara menjalankan](../README.md#cara-menjalankan-panduan-cepat-untuk-non-qa) |
| Eksekusi paralel dan isolasi data | [Eksekusi paralel & isolasi](../README.md#eksekusi-paralel--isolasi) |
| Env Dev/Staging/Prod dan guard write | [Env Dev/Staging/Prod & guard write](../README.md#env-devstagingprod--guard-write) |

## Menambah artikel

1. Pilih folder sesuai topik: `ui/`, `api/`, atau `ci/`. Buat folder baru bila belum ada.
2. Nama file memakai huruf kecil dan tanda hubung, misalnya `api/booking-client.md`.
3. Awali artikel dengan baris *Terakhir dicocokkan dengan kode: `<commit>` (`<tanggal>`)* supaya pembaca tahu seberapa baru isinya.
4. Tautkan file sumber dengan path relatif (contoh `../../pages/LoginPage.ts`) agar bisa diklik di GitHub.
5. Tambahkan satu baris di tabel **Daftar artikel** di atas.
6. Bila kode berubah dan artikel tidak lagi cocok, perbarui artikel di PR yang sama.
