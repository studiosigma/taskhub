# TaskHub — Rekomendasi UI/UX

## 📱 Filosofi Desain

TaskHub harus terasa seperti **"seseorang yang membantu"** bukan **"platform transaksi"**.

| Prinsip | Implementasi |
|---------|--------------|
| **Mobile First** | Semua komponen dirancang untuk layar HP terlebih dahulu |
| **Satu Role** | Tidak ada tampilan "Task Owner" vs "Helper" — hanya "User" |
| **Cepat** | Task bisa dibuat < 30 detik, apply 1 tap |
| **Sederhana** | Maksimal 3 langkah per action |
| **No Commission** | UI tidak boleh menunjukkan saldo, escrow, atau potongan biaya |

---

## 🎨 Design System

### Warna (Palette)

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `primary` | `#6366F1` (Indigo 500) | Tombol utama, link, header aktif |
| `primary-dark` | `#4F46E5` | Hover state tombol |
| `secondary` | `#F59E0B` (Amber 500) | Badge, rating stars, highlight |
| `success` | `#10B981` (Emerald 500) | Status completed, verified |
| `danger` | `#EF4444` (Red 500) | Cancel, hapus, report |
| `bg` | `#F8FAFC` | Background utama |
| `surface` | `#FFFFFF` | Card, modal |
| `text-primary` | `#0F172A` | Judul, body |
| `text-secondary` | `#64748B` | Deskripsi, timestamp |
| `border` | `#E2E8F0` | Garis pemisah |

### Tipografi

- **Font**: Inter (sans-serif) — readable di ukuran kecil
- **Heading**: `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px)
- **Body**: `text-sm` (14px) untuk mobile, `text-base` (16px) untuk desktop
- **Caption**: `text-xs` (12px) untuk timestamp, counter
- **Use case**: Semua teks informasional pakai `text-secondary`

### Spacing

- Padding card: `p-4` (16px)
- Gap antar elemen: `gap-3` (12px)
- Margin antar section: `mb-6` (24px)
- Touch target minimal: `min-h-11` (44px) — critical untuk mobile

### Ikon

- **Library**: Lucide Icons (ringan, konsisten)
- **Style**: Outline, stroke-width 2
- **Ukuran**: `w-5 h-5` (20px) default, `w-6 h-6` untuk nav

---

## 🗺️ Navigasi (Bottom Nav — Mobile)

```
┌─────────────────────────┐
│                         │
│   [Beranda] [Cari]      │
│   [Buat Task] [Pesan]   │
│   [Profil]              │
│                         │
└─────────────────────────┘
```

### Bottom Navigation (5 tab)
| Tab | Ikon | Label | Tujuan |
|-----|------|-------|--------|
| 1 | `🏠` | Beranda | Explore task terdekat |
| 2 | `🔍` | Cari | Filter & search task |
| 3 | `➕` | Buat | Cepat buat task baru (FAB) |
| 4 | `💬` | Pesan | Inbox chat |
| 5 | `👤` | Profil | Profile, my tasks, settings |

> FAB (Floating Action Button) "Buat Task" paling menonjol — ini **action utama** TaskHub.

---

## 📄 Halaman Utama

### 1. Beranda (Explore)

```
┌─────────────────────────┐
│ 🔍 [Cari task...]       │
│                         │
│ 📂 KATEGORI (horizontal)│
│ [Semua] [Pindahan] [..] │
│                         │
│ 📋 TASK TERDEKAT        │
│ ┌─────────────────────┐ │
│ │ 🏠 Butuh 2 org      │ │
│ │    pindahan rmh      │ │
│ │    Rp150.000 │ 3 jam │ │
│ │    📍Jakarta │ ⭐4.5 │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ...                 │ │
│ └─────────────────────┘ │
│                         │
│ [+ BUAT TASK BARU]      │
└─────────────────────────┘
```

**UX Notes:**
- Kategori horizontal: swipeable, active state bottom border primary
- Task card: single column (mobile), max 2 column (tablet)
- Jarak: tampilkan badge "📍 2.5 km" untuk proximity
- Loading: skeleton shimmer (bukan spinner)
- Empty state: ilustrasi + "Belum ada task di sekitarmu"

### 2. Detail Task

```
┌─────────────────────────┐
│ ← Kembali        ⭐ Simpan│
│                         │
│ 📸 [Foto task]          │
│                         │
│ 🏠 Butuh 2 org pindahan │
│                         │
│ 👤 Owner: Andi ⭐4.8    │
│ 📍 Jakarta, Kemang      │
│ 💰 Rp150.000            │
│ ⏱ 3 jam                │
│ 📦 Kategori: Pindahan   │
│ 📅 Dibuat: 2 jam lalu   │
│                         │
│ 📝 Deskripsi            │
│ "Butuh bantuan bawa     │
│  furniture ke lantai 2" │
│                         │
│ ┌─────────────────────┐ │
│ │  💬 AMBIL TASK      │ │
│ └─────────────────────┘ │
│                         │
│ 👥 2 orang sudah melamar│
└─────────────────────────┘
```

**UX Notes:**
- Tombol "AMBIL TASK" full-width, primary color, sticky bottom
- Jika owner: tampilkan daftar pelamar bukan tombol ambil
- Jika sudah diambil: tampilkan status + tombol chat
- Foto task: horizontal scroll, bisa di-zoom
- Status task: badge colored di pojok card

### 3. Buat Task (Form)

```
┌─────────────────────────┐
│ ← Kembali   ✨ Task Baru│
│                         │
│ 📋 Judul Task           │
│ ┌─────────────────────┐ │
│ │ Cth: Butuh bantuan  │ │
│ │ pindahan            │ │
│ └─────────────────────┘ │
│                         │
│ 📝 Deskripsi            │
│ ┌─────────────────────┐ │
│ │ Ceritakan detail... │ │
│ └─────────────────────┘ │
│                         │
│ 📂 Kategori             │
│ ┌─────────────────────┐ │
│ │ Pilih kategori ▼    │ │
│ └─────────────────────┘ │
│                         │
│ 💰 Budget               │
│ ┌─────┬───────────────┐ │
│ │ Rp  │  150.000      │ │
│ └─────┴───────────────┘ │
│                         │
│ ⏱ Durasi                │
│ ┌─────────────────────┐ │
│ │ 3 jam               │ │
│ └─────────────────────┘ │
│                         │
│ 👥 Helper Dibutuhkan    │
│ ┌────[━●━━━━━] 2 org──┐ │
│                         │
│ 📍 Lokasi               │
│ ┌─────────────────────┐ │
│ │ Gunakan lokasi saya │ │
│ └─────────────────────┘ │
│                         │
│ 📸 Foto (opsional)      │
│ ┌─────┐ ┌─────┐ ┌─────┐│
│ │➕   │ │➕   │ │➕   ││
│ └─────┘ └─────┘ └─────┘│
│                         │
│ ┌─────────────────────┐ │
│ │  🚀 PUBLISH TASK    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**UX Notes:**
- Progress bar di atas: step 1/2 → step 2/2
- Budget: input dengan format number otomatis (1.000.000)
- Slider helper: native range input dengan label jumlah
- Lokasi: auto-detect GPS, fallback ke peta manual
- Foto: max 5 foto, bisa preview sebelum upload
- **Tombol Publish**: disabled sampai semua required field terisi
- Draft auto-save ke local storage

### 4. My Tasks (Sidebar Section)

```
┌─────────────────────────┐
│ ← Profil                │
│                         │
│ 📋 TASK SAYA (tabs)     │
│                         │
│ [Taskku] [Lamaran]      │
│ [Berjalan] [Selesai]    │
│                         │
│ ── TASK SAYA ──         │
│ ┌─────────────────────┐ │
│ │ 🏠 Pindahan Rumah   │ │
│ │ ⏳ OPEN │ 2 pelamar  │ │
│ │ Rp150.000            │ │
│ │ [Edit] [Tutup]       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🧹 Bersihin Rumah   │ │
│ │ ✅ IN PROGRESS       │ │
│ │ 👤 Helper: Budi ⭐4.2│ │
│ │ [Chat] [Selesaikan]  │ │
│ └─────────────────────┘ │
│                         │
│ ── LAMARAN SAYA ──      │
│ ┌─────────────────────┐ │
│ │ 🎟️ Event Crew       │ │
│ │ ⏳ Pending           │ │
│ │ [Batalkan Lamaran]   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**UX Notes:**
- Tab horizontal: swipeable
- Setiap card punya action button berbeda sesuai status
- Status badge: colored (`OPEN`=green, `IN_PROGRESS`=blue, `COMPLETED`=gray)
- Empty state per tab: ilustrasi berbeda

### 5. Chat / Inbox

```
┌─────────────────────────┐
│ ← Kembali   💬 Chat     │
│                         │
│ ┌─────────────────────┐ │
│ │ 👤 Andi              │ │
│ │ 📦 Pindahan Rumah   │ │
│ │ 🕐 5 menit lalu      │ │
│ │ "Ok siap"            │ │
│ └───────────●──────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 👤 Budi              │ │
│ │ 🧹 Bersihin Rumah   │ │
│ │ 🕐 1 jam lalu        │ │
│ │ "Masih butuh?"       │ │
│ └─────────────────────┘ │
│                         │
│ ── OPEN CHAT ──         │
│ ┌─────────────────────┐ │
│ │ 👤 Andi              │ │
│ │ 🟢 Online            │ │
│ │ ────────────────     │ │
│ │ Haloo                │ │
│ │ ────────────────     │ │
│ │ Ada masih butuh?     │ │
│ │ ────────────────     │ │
│ │              Iya dong│ │
│ │              ────────│ │
│ │              🕐 10.30│ │
│ │                         │
│ │ [Ketik pesan...] ➤   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**UX Notes:**
- Chat bubble: sender right (primary), receiver left (gray)
- Typing indicator: 3 dots animation
- Online/offline indicator: green dot
- Read status: double check ✓✓
- Task info card di atas chat: collapsible
- Quick reply: button untuk "Siap", "Terima kasih"

### 6. Profil User

```
┌─────────────────────────┐
│                         │
│      👤 (Foto)          │
│      Andi Pratama       │
│      ⭐4.8 • 12 tugas   │
│      ✅ Terverifikasi   │
│                         │
│ ┌─────────────────────┐ │
│ │ 📋 Task Saya        │ │
│ ├─────────────────────┤ │
│ │ ⭐ Ulasan (15)       │ │
│ ├─────────────────────┤ │
│ │ ⚙️ Pengaturan       │ │
│ ├─────────────────────┤ │
│ │ ❤️ Dukung TaskHub   │ │
│ ├─────────────────────┤ │
│ │ 🚪 Keluar           │ │
│ └─────────────────────┘ │
│                         │
│ ── ULASAN TERBARU ──    │
│ "Makasih banget          │
│  bantuannya ✅"          │
│ — Budi, 2 hari lalu     │
└─────────────────────────┘
```

**UX Notes:**
- Avatar: bisa di-tap untuk full screen
- Rating: stars visual
- Completed task count: angka menonjol
- Verified badge: centang hijau
- Menu items: chevron icon di kanan

### 7. Dukung TaskHub

```
┌─────────────────────────┐
│ ❤️ DUKUNG TASKHUB      │
│                         │
│ TaskHub gratis tanpa    │
│ komisi. Dukung kami     │
│ agar terus berjalan!    │
│                         │
│ ┌─────────────────────┐ │
│ │     [QRIS SCAN]     │ │
│ │  Scan untuk bayar   │ │
│ └─────────────────────┘ │
│                         │
│ Atau kirim via:         │
│                         │
│ 💳 BCA: 1234567890     │
│ 📱 GoPay: 08123456789  │
│                         │
│ ─ atau ─                │
│                         │
│ 💰 Nominal Bebas        │
│ ┌─────────────────────┐ │
│ │ Rp _________        │ │
│ └─────────────────────┘ │
│                         │
│ 📝 Pesan (opsional)     │
│ ┌─────────────────────┐ │
│ │ Semangat terus!     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │  ❤️ KIRIM DONASI    │ │
│ └─────────────────────┘ │
│                         │
│ ── DONASI TERBARU ──    │
│ 👤 Andi • Rp50.000      │
│ 🕐 2 jam lalu           │
└─────────────────────────┘
```

**UX Notes:**
- Halaman ini adalah SATU-SATUNYA transaksi di TaskHub — harus terasa personal dan bermakna
- QRIS: generate QR code dinamis
- Nominal bebas: input tanpa batas minimum
- Animasi: ❤️ floating heart saat donasi berhasil
- Donation wall: list donatur (bisa anonim)

---

## 🔄 Flow & State

### Flow Task

```
[DRAFT] → PUBLISH → [OPEN] → ASSIGN → [ASSIGNED] → START → [IN_PROGRESS] → COMPLETE → [COMPLETED]
                                                                                    ↓
                                                                              [REVIEW] ← owner beri rating ke helper
```

### Empty States

| Halaman | Ilustrasi | Pesan |
|---------|-----------|-------|
| Explore | 🏝️ | "Belum ada task. Jadilah yang pertama membuat task!" |
| My Tasks | 📋 | "Kamu belum punya task. Yuk buat task pertama!" |
| Inbox | 💬 | "Belum ada chat. Mulai dengan mengambil task!" |
| Notifications | 🔔 | "Belum ada notifikasi" |
| Search | 🔍 | "Task tidak ditemukan. Coba keyword lain" |
| Lamaran | 📝 | "Belum ada lamaran. Cari task terdekat!" |

### Loading States

- Skeleton shimmer untuk list task
- Spinner hanya untuk submit form
- Progress bar untuk upload foto

### Error States

- **Network error**: Toast "Koneksi terputus" + retry button
- **Form error**: Inline validation merah di bawah field
- **403/404**: Halaman dengan ilustrasi + tombol "Kembali ke Beranda"

---

## 📱 Responsive Behavior

| Breakpoint | Tampilan | Layout |
|-----------|----------|--------|
| < 640px | Mobile (primary) | Single column, bottom nav |
| 640-1024px | Tablet | 2 column grid, sidebar |
| > 1024px | Desktop | Full sidebar + main content |

### Mobile (Primary)
- Bottom navigation 5 tab
- Full-width cards
- Sticky bottom button untuk actions
- Swipeable horizontal kategori
- Bottom sheet untuk filter

### Tablet
- Sidebar navigasi (accordion style)
- 2 kolom grid task
- Modal untuk form
- Split view untuk chat

### Desktop
- Sidebar tetap di kiri
- 3 kolom grid task
- Multi-window chat
- Keyboard shortcuts

---

## 🧩 Komponen Reusable

```
src/components/
├── ui/
│   ├── Button.tsx          # Primary, secondary, ghost, danger
│   ├── Card.tsx            # Task card, profile card
│   ├── Badge.tsx           # Status badge (OPEN, IN_PROGRESS, etc.)
│   ├── Avatar.tsx          # User avatar with fallback
│   ├── Rating.tsx          # Star rating
│   ├── Input.tsx           # Form input with validation
│   ├── BottomSheet.tsx     # Mobile bottom sheet
│   ├── Modal.tsx           # Modal/dialog
│   ├── Toast.tsx           # Notification toast
│   ├── Skeleton.tsx        # Loading skeleton
│   ├── EmptyState.tsx      # Empty state with ilustration
│   └── ErrorState.tsx      # Error state with retry
├── layout/
│   ├── BottomNav.tsx       # Mobile bottom navigation
│   ├── Sidebar.tsx         # Desktop/tablet sidebar
│   ├── Header.tsx          # Top header
│   └── Layout.tsx          # Main layout wrapper
└── features/
    ├── TaskCard.tsx        # Task card with all status variants
    ├── TaskForm.tsx        # Create/edit task form
    ├── ChatBubble.tsx      # Chat message bubble
    ├── ChatList.tsx        # Inbox chat list
    ├── ApplicantList.tsx   # List of applicants
    └── DonationForm.tsx    # Support donation form
```

---

## 🚀 Animasi & Micro-interactions

| Elemen | Animasi | Durasi |
|--------|---------|--------|
| Bottom nav tab | Spring scale 1→1.1→1 | 200ms |
| Task card tap | Scale 1→0.98 | 150ms |
| FAB | Rotate +45° saat expanded | 300ms |
| Skeleton | Shimmer gradient | 1.5s cycle |
| Toast | Slide in from top | 300ms |
| Modal | Fade + scale 0.95→1 | 200ms |
| Heart donation | Float up + fade | 1s |
| Typing indicator | 3 dots bounce | 0.5s cycle |
| Pull to refresh | Spinner + haptic | - |
| Page transition | Slide left/right | 250ms |

---

## 📊 Prioritas Implementasi

| Prioritas | Halaman | Estimasi |
|-----------|---------|----------|
| **P0** | Beranda (Explore), Detail Task, Buat Task, Auth | 5 hari |
| **P1** | My Tasks, Chat, Profil, Search | 4 hari |
| **P2** | Notifications, Reviews, Dukung TaskHub, Admin | 3 hari |
| **P3** | Filter lanjutan, Map view, Animasi, PWA | 3 hari |

---

## ✅ Aksesibilitas

- Semua touch target minimal 44x44px
- Kontras warna: WCAG AA minimum (4.5:1)
- Label untuk semua icon button
- Keyboard navigation untuk desktop
- Screen reader friendly (aria-label)
- Pull to refresh with haptic feedback

---

## 📝 Notes untuk Developer

1. **Gunakan Next.js + TailwindCSS** untuk frontend — cocok dengan design system di atas
2. **Bottom nav vs Sidebar** — pilih berdasarkan user agent, bukan responsive query aja
3. **Optimistic UI** untuk actions like apply, withdraw — update UI dulu baru API
4. **Skeleton loading** selalu lebih baik dari spinner — user feel "ada progress"
5. **Error handling** harus human-readable — "Gagal terhubung" bukan "Error 500"
6. **Retry mechanism** untuk upload foto — jangan sampai user kehilangan data
7. **Debounce search** — 300ms delay untuk mengurangi API call
8. **Virtual list** untuk chat & task list — performa di device rendah
9. **Offline support** — cache task yang sudah dilihat
10. **Deep linking** — link langsung ke detail task dari notifikasi
