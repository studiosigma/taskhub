import { PrismaClient, TaskStatus, ApplicationStatus, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TaskHub database...\n');

  // ── Categories ──
  const categories = [
    { name: 'Rumah Tangga', icon: '🏠', description: 'Bersihin rumah, cuci AC, potong rumput, service listrik, bor air' },
    { name: 'Transportasi', icon: '🚗', description: 'Antar jemput, kirim paket, belanja pasar' },
    { name: 'Pindahan', icon: '📦', description: 'Angkut barang, packing' },
    { name: 'Digital', icon: '💻', description: 'Desain logo, edit video, bikin caption' },
    { name: 'Event', icon: '🎉', description: 'Stand by acara, masak untuk hajatan' },
    { name: 'Jasa Profesional', icon: '👨‍⚖️', description: 'Fotografer, videografer, pangkas rambut, makeup artist' },
    { name: 'Otomotif', icon: '🏍️', description: 'Cuci mobil, ganti oli, tambal ban, salon mobil' },
    { name: 'Pendidikan', icon: '📚', description: 'Les privat ngaji, bimbel, kursus bahasa' },
    { name: 'Jasa Lainnya', icon: '🔧', description: 'Jaga anak, les privat, grooming kucing' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // ── Users (password: "password123") ──
  const hashedPassword = await argon2.hash('password123');
  const usersData = [
    { id: 'user-owner-1', fullName: 'Andi Pratama', email: 'andi@taskhub.test', role: UserRole.USER, rating: 4.8, completedTask: 12, isVerified: true },
    { id: 'user-owner-2', fullName: 'Siti Rahmawati', email: 'siti@taskhub.test', role: UserRole.USER, rating: 4.5, completedTask: 8 },
    { id: 'user-helper-1', fullName: 'Budi Santoso', email: 'budi@taskhub.test', role: UserRole.USER, rating: 4.2, completedTask: 25, isVerified: true },
    { id: 'user-helper-2', fullName: 'Citra Dewi', email: 'citra@taskhub.test', role: UserRole.USER, rating: 4.9, completedTask: 37, isVerified: true },
    { id: 'user-helper-3', fullName: 'Deni Nugroho', email: 'deni@taskhub.test', role: UserRole.USER, rating: 4.0, completedTask: 5 },
    { id: 'user-admin', fullName: 'Admin TaskHub', email: 'admin@taskhub.test', role: UserRole.ADMIN, rating: 5.0, completedTask: 0, isVerified: true },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        rating: u.rating,
        completedTask: u.completedTask,
        isVerified: u.isVerified,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(u.fullName)}`,
      },
    });
  }
  console.log(`✅ ${usersData.length} users seeded (password: "password123")`);

  // ── Tasks ──
  const allCategories = await prisma.category.findMany();
  const catMap = Object.fromEntries(allCategories.map(c => [c.name, c.id]));

  const tasks = [
    {
      id: 'task-1', ownerId: 'user-owner-1', categoryId: catMap['Rumah Tangga'],
      title: 'Bersihin rumah bekas banjir', description: 'Rumah habis kebanjiran, butuh 3 orang buat bersihin lumpur dan nyuci perabotan.',
      budget: 450000, duration: '8 Jam (Full Day)', helperNeeded: 3, address: 'Bekasi Timur', status: TaskStatus.IN_PROGRESS,
    },
    {
      id: 'task-2', ownerId: 'user-owner-2', categoryId: catMap['Rumah Tangga'],
      title: 'Cuci AC 3 unit rumah', description: 'AC udah 6 bulan nggak dicuci, butuh bantuan service bersihin AC split 3 unit.',
      budget: 150000, duration: '3 Jam', helperNeeded: 1, address: 'Jakarta Selatan', status: TaskStatus.OPEN,
    },
    {
      id: 'task-3', ownerId: 'user-owner-2', categoryId: catMap['Event'],
      title: 'Crew untuk acara ulang tahun anak', description: 'Butuh 2 orang bantu siap-siap dekorasi, jaga stand makanan, dan bersihin setelah acara.',
      budget: 200000, duration: '5 Jam', helperNeeded: 2, address: 'Bandung', status: TaskStatus.OPEN,
    },
    {
      id: 'task-4', ownerId: 'user-owner-1', categoryId: catMap['Transportasi'],
      title: 'Antar Dokumen ke Kantor Client', description: 'Dokumen penting harus sampai hari ini. Butuh driver dari kantor pusat ke client di daerah SCBD.',
      budget: 100000, duration: '2 Jam', helperNeeded: 1, address: 'Jakarta Pusat', status: TaskStatus.COMPLETED,
    },
    {
      id: 'task-5', ownerId: 'user-owner-2', categoryId: catMap['Transportasi'],
      title: 'Belanja bahan makanan mingguan', description: 'Butuh bantuan belanja ke pasar tradisional. Daftar belanja sudah ada, tinggal ambil dan anter ke rumah.',
      budget: 50000, duration: '2 Jam', helperNeeded: 1, address: 'Tangerang', status: TaskStatus.OPEN,
    },
    {
      id: 'task-6', ownerId: 'user-owner-1', categoryId: catMap['Pindahan'],
      title: 'Butuh 2 orang bantu pindahan rumah', description: 'Pindahan dari apartemen ke rumah baru. Barang sudah dikemas, butuh bantu angkut ke mobil dan bongkar di tempat tujuan.',
      budget: 300000, duration: '4 Jam', helperNeeded: 2, address: 'Jakarta Selatan', status: TaskStatus.OPEN,
    },
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }
  console.log(`✅ ${tasks.length} tasks seeded`);

  // ── Assignments (for tasks that are IN_PROGRESS or COMPLETED) ──
  const assignments = [
    { taskId: 'task-2', userId: 'user-helper-1' }, // Budi assigned to bersihin rumah
    { taskId: 'task-5', userId: 'user-helper-2' }, // Citra assigned to antar dokumen
  ];

  for (const a of assignments) {
    await prisma.assignment.upsert({
      where: { id: `${a.taskId}-${a.userId}` },
      update: {},
      create: { id: `${a.taskId}-${a.userId}`, ...a },
    });
  }
  console.log(`✅ ${assignments.length} assignments seeded`);

  // ── Applications ──
  const applications = [
    { taskId: 'task-1', userId: 'user-helper-1', message: 'Saya bisa bantu, punya mobil bak' },
    { taskId: 'task-1', userId: 'user-helper-2', message: 'Saya dan teman siap bantu pindahan' },
    { taskId: 'task-3', userId: 'user-helper-1', message: 'Pengalaman jadi event organizer 2 tahun' },
    { taskId: 'task-4', userId: 'user-helper-3', message: 'Saya tukang bangunan berpengalaman' },
    { taskId: 'task-6', userId: 'user-helper-2', message: 'Saya tinggal di dekat situ, bisa bantu' },
  ];

  for (const a of applications) {
    await prisma.application.upsert({
      where: { id: `${a.taskId}-${a.userId}` },
      update: {},
      create: { id: `${a.taskId}-${a.userId}`, ...a },
    });
  }
  console.log(`✅ ${applications.length} applications seeded`);

  // ── Conversations & Messages ──
  const conv1 = await prisma.conversation.upsert({
    where: { id: 'conv-1' },
    update: {},
    create: {
      id: 'conv-1',
      taskId: 'task-2',
      participants: {
        create: [
          { userId: 'user-owner-1' },
          { userId: 'user-helper-1' },
        ],
      },
    },
    include: { participants: true },
  });

  const convMessages = [
    { conversationId: conv1.id, senderId: 'user-owner-1', content: 'Halo Budi, siap bantu bersihin rumah?' },
    { conversationId: conv1.id, senderId: 'user-helper-1', content: 'Siap, saya bisa hari ini jam 2 siang' },
    { conversationId: conv1.id, senderId: 'user-owner-1', content: 'Baik, nanti saya tunggu di lokasi ya' },
  ];

  for (const m of convMessages) {
    await prisma.message.create({ data: m });
  }
  console.log(`✅ ${convMessages.length} messages seeded`);

  // ── Reviews (for completed task-5) ──
  const review = await prisma.review.upsert({
    where: { id: 'review-1' },
    update: {},
    create: {
      id: 'review-1',
      taskId: 'task-5',
      reviewerId: 'user-owner-1',
      reviewedUserId: 'user-helper-2',
      rating: 5,
      comment: 'Makasih banget bantuannya ✅ Cepet dan ramah!',
    },
  });
  console.log(`✅ 1 review seeded`);

  // ── Donations ──
  await prisma.supportDonation.create({
    data: {
      userId: 'user-owner-1',
      amount: 50000,
      paymentMethod: 'QRIS',
      message: 'Semangat TaskHub!',
    },
  });
  console.log(`✅ 1 donation seeded`);

  // ── Notifications ──
  const notifications = [
    { userId: 'user-owner-1', title: 'Ada lamaran baru', description: 'Budi Santoso melamar task "Butuh 2 orang bantu pindahan rumah"' },
    { userId: 'user-helper-1', title: 'Lamaran diterima', description: 'Kamu diterima untuk task "Butuh 2 orang bantu pindahan rumah"' },
    { userId: 'user-owner-2', title: 'Task selesai', description: 'Task "Antar Dokumen ke Kantor Client" sudah selesai' },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
  console.log(`✅ ${notifications.length} notifications seeded`);

  console.log('\n🎉 Seeding complete!');
  console.log('   Login credentials:');
  console.log('   - andi@taskhub.test / password123 (Owner)');
  console.log('   - budi@taskhub.test / password123 (Helper)');
  console.log('   - admin@taskhub.test / password123 (Admin)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
