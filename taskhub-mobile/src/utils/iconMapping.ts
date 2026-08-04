/**
 * Shared utility to map category names to Ionicons icon names.
 * Used by HomeScreen, ExploreScreen, and CreateTaskScreen.
 */
export function getCategoryIconName(name: string): string {
  const c = name?.toLowerCase() || '';

  if (c.includes('rumah') || c.includes('bersih') || c.includes('cuci ac') || c.includes('service') || c.includes('bor')) return 'home-outline';
  if (c.includes('transport') || c.includes('antar') || c.includes('kirim') || c.includes('driver') || c.includes('kurir')) return 'car-outline';
  if (c.includes('pindah') || c.includes('angkut') || c.includes('barang')) return 'cube-outline';
  if (c.includes('digital') || c.includes('desain') || c.includes('edit') || c.includes('caption')) return 'laptop-outline';
  if (c.includes('event') || c.includes('acara') || c.includes('stand by') || c.includes('hajatan') || c.includes('masak')) return 'calendar-outline';
  if (c.includes('profesional') || c.includes('foto') || c.includes('video') || c.includes('makeup') || c.includes('pangkas')) return 'briefcase-outline';
  if (c.includes('oto') || c.includes('mobil') || c.includes('motor') || c.includes('bengkel') || c.includes('cuci mobil') || c.includes('ganti oli') || c.includes('tambal')) return 'construct-outline';
  if (c.includes('pendidikan') || c.includes('les') || c.includes('ngaji') || c.includes('bimbel') || c.includes('kursus') || c.includes('sekolah')) return 'school-outline';
  if (c.includes('lain') || c.includes('jaga') || c.includes('grooming') || c.includes('kucing')) return 'apps-outline';

  return 'ellipse-outline';
}
