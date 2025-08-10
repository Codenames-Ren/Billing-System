# Internal Billing System - Sistem Manajemen Billing WiFi

[![Kontributor][contributors-shield]][contributors-url]
[![Fork][forks-shield]][forks-url]
[![Bintang][stars-shield]][stars-url]
[![Masalah][issues-shield]][issues-url]
[![Lisensi MIT][license-shield]][license-url]

<!-- LOGO PROYEK -->
<br />
<div align="center">
  <h3 align="center">Internal Billing System</h3>
  
  <p align="center">
    Sistem manajemen billing WiFi internal dengan integrasi MikroTik dan dashboard analitik komprehensif.
    <br />
    <a href="https://github.com/Codenames-Ren/Billing-System"><strong>Jelajahi dokumentasi »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Codenames-Ren/Billing-System">Lihat Demo</a>
    ·
    <a href="https://github.com/Codenames-Ren/Billing-System/issues/new?labels=bug&template=bug-report---.md">Laporkan Bug</a>
    ·
    <a href="https://github.com/Codenames-Ren/Billing-System/issues/new?labels=enhancement&template=feature-request---.md">Ajukan Fitur</a>
  </p>
</div>

<!-- DAFTAR ISI -->
<details>
  <summary>Daftar Isi</summary>
  <ol>
    <li>
      <a href="#tentang-proyek">Tentang Proyek</a>
      <ul>
        <li><a href="#dibangun-dengan">Dibangun Dengan</a></li>
      </ul>
    </li>
    <li>
      <a href="#memulai">Memulai</a>
      <ul>
        <li><a href="#prasyarat">Prasyarat</a></li>
        <li><a href="#instalasi">Instalasi</a></li>
      </ul>
    </li>
    <li><a href="#penggunaan">Penggunaan</a></li>
    <li><a href="#fitur">Fitur</a></li>
    <li><a href="#struktur-proyek">Struktur Proyek</a></li>
    <li><a href="#konfigurasi">Konfigurasi</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#kontribusi">Kontribusi</a></li>
    <li><a href="#lisensi">Lisensi</a></li>
    <li><a href="#kontak">Kontak</a></li>
    <li><a href="#penghargaan">Penghargaan</a></li>
  </ol>
</details>

<!-- TENTANG PROYEK -->

## Tentang Proyek

**Internal Billing System** adalah solusi manajemen billing WiFi yang dirancang khusus untuk penggunaan internal ISP (Internet Service Provider) atau penyedia layanan WiFi. Sistem ini menyediakan platform terintegrasi untuk mengelola pelanggan, paket internet, pembayaran, dan sinkronisasi otomatis dengan perangkat MikroTik.

Sistem ini dikembangkan dengan fokus pada efisiensi operasional dan kemudahan penggunaan, memungkinkan administrator untuk mengelola seluruh aspek bisnis ISP dari satu dashboard terpusat.

Mengapa sistem ini istimewa:

- **Integrasi MikroTik**: Sinkronisasi otomatis dengan router MikroTik melalui API
- **Role-Based Access Control (RBAC)**: Sistem pembatasan akses berdasarkan peran pengguna
- **Dashboard Analitik**: Visualisasi data omset dan statistik bisnis dengan chart interaktif
- **Export PDF**: Kemampuan export laporan dalam format PDF
- **Manajemen Paket Fleksibel**: Pembuatan paket WiFi berdasarkan kecepatan dengan penetapan harga custom
- **Otomatisasi Setup**: Setup pelanggan baru otomatis tersinkronisasi dengan MikroTik
- **Desain Responsif**: Antarmuka yang optimal di desktop dan mobile

### Dibangun Dengan

Proyek ini dibangun menggunakan teknologi modern untuk memastikan performa tinggi dan skalabilitas yang baik.

- [![Go][Go.dev]][Go-url] - Backend API dengan Gin Framework
- [![PostgreSQL][PostgreSQL.com]][PostgreSQL-url] - Database Management System
- [![HTML5][HTML5.com]][HTML5-url] - Frontend Structure
- [![CSS3][CSS3.com]][CSS3-url] - Styling & Layout
- [![JavaScript][JavaScript.com]][JavaScript-url] - Frontend Interactivity
- [![MikroTik][MikroTik.com]][MikroTik-url] - Network Infrastructure Integration

<!-- MEMULAI -->

## Memulai

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut.

### Prasyarat

Pastikan Anda memiliki hal-hal berikut terpasang di sistem Anda:

- Go 1.19 atau versi lebih baru
- Git
- PostgreSQL
- MikroTik RouterOS (untuk integrasi)
- Browser web modern
- Akses jaringan lokal untuk deployment internal

### Instalasi

1. Clone repository ini

   ```sh
   git clone https://github.com/Codenames-Ren/Billing-System.git
   ```

2. Masuk ke direktori proyek

   ```sh
   cd Billing-System
   ```

3. Install dependencies Go

   ```sh
   go mod download
   ```

4. Salin file konfigurasi dan sesuaikan dengan environment lokal Anda

   ```sh
   cp config.example.yaml config.yaml
   ```

5. Konfigurasi database PostgreSQL dan MikroTik API di file `config.yaml`

6. Setup database PostgreSQL dan jalankan migrasi

   ```sh
   go run main.go migrate
   ```

7. Jalankan aplikasi di server lokal

   ```sh
   go run main.go
   ```

8. Akses aplikasi melalui IP lokal `http://[IP-LOCAL]:8080`

<!-- PENGGUNAAN -->

## Penggunaan

### Fitur Utama

1. **Dashboard Analytics**:
   - Grafik omset harian, mingguan, dan bulanan
   - Statistik pelanggan aktif
   - Monitoring bandwidth usage
   - Key Performance Indicators (KPI)

2. **Manajemen Paket**:
   - Buat paket berdasarkan kecepatan upload/download
   - Tentukan harga custom untuk setiap paket
   - Kelola durasi paket (harian, mingguan, bulanan)
   - Sinkronisasi otomatis dengan MikroTik

3. **Manajemen Pelanggan**:
   - Registrasi pelanggan baru
   - Update informasi pelanggan
   - Monitoring status koneksi
   - Riwayat pembayaran

4. **Manajemen Pembayaran (Cash-Based)**:
   - Pencatatan pembayaran tunai
   - Generate invoice untuk pembayaran manual
   - Export laporan keuangan ke PDF
   - Tracking outstanding payments manual
   - Sistem reminder untuk pembayaran jatuh tempo

5. **Role-Based Access Control**:
   - Admin: Akses penuh ke semua fitur
   - Manager: Akses ke laporan dan monitoring
   - Operator: Akses terbatas untuk operasional harian

### Login Default

```
Admin:
Username: admin
Password: admin123

Teknisi:
Username: teknisi
Password: teknisi123

Kasir:
Username: kasir
Password: kasir123
```

### Konfigurasi MikroTik

1. Aktifkan API di MikroTik:
   ```
   /ip service set api disabled=no
   ```

2. Buat user untuk API access:
   ```
   /user add name=billing group=full password=billing123
   ```

3. Update konfigurasi di `config.yaml`:
   ```yaml
   mikrotik:
     host: "192.168.1.1"
     port: 8728
     username: "billing"
     password: "billing123"
   ```

## Fitur

- **🏢 Multi-Tenant**: Dukungan untuk multiple ISP dalam satu sistem
- **📊 Dashboard Analytics**: Visualisasi data bisnis dengan chart interaktif
- **🔒 RBAC Security**: Sistem keamanan berbasis peran pengguna
- **📡 MikroTik Integration**: Sinkronisasi otomatis dengan router MikroTik
- **💰 Cash-Based Billing**: Sistem billing manual untuk pembayaran tunai
- **📈 Revenue Tracking**: Pelacakan omset real-time dengan export PDF
- **🌐 Package Management**: Manajemen paket WiFi dengan konfigurasi kecepatan
- **👥 Customer Management**: Sistem manajemen pelanggan internal
- **📱 Local Network Access**: Akses melalui jaringan lokal tanpa hosting eksternal
- **🔄 Auto Sync**: Sinkronisasi otomatis setup pelanggan baru ke MikroTik
- **📋 Manual Report Generation**: Generate laporan keuangan dan operasional manual
- **⚡ High Performance**: Dibangun dengan Go untuk performa tinggi

<!-- STRUKTUR PROYEK -->

## Struktur Proyek

```
Billing-System/
├── cmd/
│   └── main.go                 # Entry point aplikasi
├── internal/
│   ├── handlers/              # HTTP handlers
│   ├── models/                # Data models
│   ├── services/              # Business logic
│   ├── repository/            # Data access layer
│   └── middleware/            # Custom middleware
├── pkg/
│   ├── database/              # Database connection
│   ├── mikrotik/              # MikroTik API client
│   └── utils/                 # Utility functions
├── static/
│   ├── css/                   # CSS files
│   ├── js/                    # JavaScript files
│   └── images/                # Static images
├── templates/                 # HTML templates
├── config/
│   └── config.yaml           # Configuration file
├── migrations/               # Database migrations
└── docs/                    # Documentation
```

<!-- KONFIGURASI -->

## Konfigurasi

### Database PostgreSQL

```yaml
database:
  driver: "postgres"
  host: "localhost"
  port: 5432
  username: "billing_user"
  password: "billing_pass"
  database: "billing_system"
  sslmode: "disable"
```

### MikroTik API

```yaml
mikrotik:
  host: "192.168.1.1"
  port: 8728
  username: "api_user"
  password: "api_pass"
  timeout: 30
```

### Server (Local Network)

```yaml
server:
  host: "0.0.0.0"  # Untuk akses dari jaringan lokal
  port: 8080
  debug: true
  local_network: true
```

<!-- ROADMAP -->

## Roadmap

- [x] Sistem autentikasi dan RBAC
- [x] Dashboard analytics dengan chart
- [x] Integrasi MikroTik API
- [x] Manajemen paket dan pelanggan
- [x] Export laporan ke PDF
- [x] Sistem billing manual (cash-based)
- [ ] Notifikasi WhatsApp/SMS untuk reminder pembayaran
- [ ] Improved dashboard dengan lebih banyak chart
- [ ] Advanced reporting & analytics
- [ ] Backup dan restore otomatis
- [ ] Load balancing support untuk multiple server
- [ ] Docker containerization untuk deployment
- [ ] Monitoring system dengan alerts
- [ ] API documentation dengan Swagger
- [ ] Multi-location support untuk cabang
- [ ] Enhanced security features

Lihat [issues](https://github.com/Codenames-Ren/Billing-System/issues) untuk daftar lengkap fitur yang direncanakan dan bug yang diketahui.

<!-- KONTRIBUSI -->

## Kontribusi

Kontribusi adalah hal yang membuat komunitas open source menjadi tempat yang luar biasa untuk belajar, menginspirasi, dan berkreasi. Setiap kontribusi yang Anda berikan **sangat dihargai**.

Jika Anda memiliki saran untuk membuat proyek ini lebih baik, silakan fork repo ini dan buat pull request. Anda juga bisa membuka issue dengan tag "enhancement".

1. Fork Proyek
2. Buat Feature Branch (`git checkout -b feature/FiturAmazing`)
3. Commit Perubahan (`git commit -m 'Add FiturAmazing'`)
4. Push ke Branch (`git push origin feature/FiturAmazing`)
5. Buka Pull Request

### Panduan Kontribusi

- Pastikan kode mengikuti Go conventions
- Tambahkan unit tests untuk fitur baru
- Update dokumentasi jika diperlukan
- Gunakan conventional commits untuk pesan commit

### Kontributor teratas:

<a href="https://github.com/Codenames-Ren/Billing-System/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Codenames-Ren/Billing-System" alt="contrib.rocks image" />
</a>

<!-- LISENSI -->

## Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

<!-- KONTAK -->

## Kontak

Codenames-Ren - [@CodeNamesRen](https://github.com/Codenames-Ren)

Link Proyek: [https://github.com/Codenames-Ren/Billing-System](https://github.com/Codenames-Ren/Billing-System)

<!-- PENGHARGAAN -->

## Penghargaan

Sumber daya dan tools yang membantu pengembangan proyek ini:

- [Gin Web Framework](https://gin-gonic.com/)
- [GORM](https://gorm.io/)
- [Chart.js](https://www.chartjs.org/)
- [MikroTik RouterOS API](https://help.mikrotik.com/docs/display/ROS/API)
- [Go PDF Library](https://github.com/jung-kurt/gofpdf)
- [GitHub Pages](https://pages.github.com)
- [Shields.io](https://shields.io)

<!-- TAUTAN & GAMBAR MARKDOWN -->

[contributors-shield]: https://img.shields.io/github/contributors/Codenames-Ren/Billing-System.svg?style=for-the-badge
[contributors-url]: https://github.com/Codenames-Ren/Billing-System/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Codenames-Ren/Billing-System.svg?style=for-the-badge
[forks-url]: https://github.com/Codenames-Ren/Billing-System/network/members
[stars-shield]: https://img.shields.io/github/stars/Codenames-Ren/Billing-System.svg?style=for-the-badge
[stars-url]: https://github.com/Codenames-Ren/Billing-System/stargazers
[issues-shield]: https://img.shields.io/github/issues/Codenames-Ren/Billing-System.svg?style=for-the-badge
[issues-url]: https://github.com/Codenames-Ren/Billing-System/issues
[license-shield]: https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge
[license-url]: https://github.com/Codenames-Ren/Billing-System/blob/master/LICENSE
[PostgreSQL.com]: https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Go.dev]: https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white
[Go-url]: https://golang.org/
[HTML5.com]: https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white
[HTML5-url]: https://html.spec.whatwg.org/
[CSS3.com]: https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white
[CSS3-url]: https://www.w3.org/Style/CSS/
[JavaScript.com]: https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[MikroTik.com]: https://img.shields.io/badge/mikrotik-%23293241.svg?style=for-the-badge&logo=mikrotik&logoColor=white
[MikroTik-url]: https://mikrotik.com/


# Hiatus.
