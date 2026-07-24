import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { tasksApi, categoriesApi } from '../services';
import { Category } from '../types';
import { Button } from '../components/ui/Button';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { TaskMapView } from '../components/ui/TaskMapView';
import { useToast } from '../components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&q=80',
];

const DURATION_OPTIONS = ['2 Jam', '4 Jam', '6 Jam', '8 Jam (Full Day)'];
const DATE_OPTIONS = ['Hari Ini', 'Besok', 'Lusa'];

export const CreateTaskScreen: React.FC<NativeStackScreenProps<RootStackParamList, "CreateTask">> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(-6.2383);
  const [longitude, setLongitude] = useState<number | undefined>(107.001);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [rawBudget, setRawBudget] = useState('250000');
  const [isNego, setIsNego] = useState(false);
  const [dateText, setDateText] = useState('Hari Ini');
  const [duration, setDuration] = useState('6 Jam');
  const [photos, setPhotos] = useState<string[]>(MOCK_PHOTOS);
  const [loading, setLoading] = useState(false);

  const totalSteps = 6;

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data: any) => {
        const list: Category[] = Array.isArray(data) ? data : [];
        setCategories(list);
        if (list.length > 0) {
          setSelectedCategoryId(list[0].id);
        }
      })
      .catch((e) => console.warn('fetch categories error', e));
  }, []);

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.show({ type: 'error', title: 'Izin Ditolak', message: 'Akses ke galeri foto dibutuhkan' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleGetLocation = async () => {
    try {
      setFetchingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Izin akses lokasi ditolak');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const item = reverseGeocode[0];
        const formattedAddress = [item.name, item.street, item.city, item.region]
          .filter(Boolean)
          .join(', ');
        setAddress(formattedAddress || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      } else {
        setAddress('Bekasi Timur');
      }
    } catch (e) {
      setAddress('Bekasi Timur');
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await tasksApi.create({
        title: title || 'Butuh 3 orang bantu bersihkan rumah bekas banjir',
        description: description || title,
        budget: parseInt(rawBudget, 10) || 250000,
        duration: duration || '6 Jam',
        categoryId: selectedCategoryId || (categories[0]?.id || 'cmd0category001'),
        helperNeeded: 3,
        address: address || 'Bekasi Timur, Kota Bekasi',
        latitude,
        longitude,
      });
      toast.show({ type: 'success', title: 'Sukses', message: 'Task berhasil dipublikasikan!' });
      navigation.goBack();
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Gagal', message: e.response?.data?.message || 'Gagal membuat task' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Bar */}
      <View style={[styles.wizardHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handlePrevStep}>
          <Ionicons name="chevron-back" size={24} color="#0B0B0B" />
        </TouchableOpacity>
        <Text style={styles.wizardTitle}>Buat Task Baru</Text>
        <Text style={styles.stepCounterText}>{currentStep}/{totalSteps}</Text>
      </View>

      {/* Progress Bar Segments */}
      <View style={styles.progressBarRow}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View
            key={s}
            style={[
              styles.progressSegment,
              s <= currentStep && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Apa yang ingin dibantu & Kategori */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepBigTitle}>Apa yang ingin dibantu?</Text>
            <Text style={styles.stepSubtitle}>
              Ceritakan secara singkat task yang Anda butuhkan
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Contoh: Bersihkan rumah, antar barang, potong rumput, dll"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                multiline
                numberOfLines={5}
                maxLength={80}
              />
              <Text style={styles.charCounterText}>{title.length}/80</Text>
            </View>

            {/* Dynamic Category Chips Selection */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>Pilih Kategori Task</Text>
            <View style={styles.categoryChipsGrid}>
              {categories.map((c) => {
                const isSelected = selectedCategoryId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.categoryChipPill,
                      isSelected && styles.categoryChipPillSelected,
                    ]}
                    onPress={() => setSelectedCategoryId(c.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'grid-outline'}
                      size={14}
                      color={isSelected ? COLORS.textPrimary : COLORS.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 2/6: Dimana lokasinya? */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepBigTitle}>Dimana lokasinya?</Text>
            <Text style={styles.stepSubtitle}>Pilih lokasi task Anda</Text>

            {/* Map Card Container */}
            <View style={styles.mapCardContainer}>
              <TaskMapView
                latitude={latitude || -6.2383}
                longitude={longitude || 107.001}
                title={title || 'Lokasi Task'}
                address={address}
              />

              <TouchableOpacity
                style={styles.floatingLocationPill}
                onPress={handleGetLocation}
                disabled={fetchingLocation}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-sharp" size={14} color="#0B0B0B" style={{ marginRight: 4 }} />
                  <Text style={styles.floatingLocationPillText}>
                    {fetchingLocation ? 'Mengambil...' : 'Gunakan Lokasi Saya'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Address Input Field */}
            <View style={styles.addressInputBox}>
              <TextInput
                style={styles.addressTextInput}
                placeholder="Contoh: Bekasi Timur, Kota Bekasi"
                placeholderTextColor="#94A3B8"
                value={address}
                onChangeText={setAddress}
              />
              <Ionicons name="location" size={18} color="#0B0B0B" />
            </View>
          </View>
        )}

        {/* Step 3/6: Berapa budget yang Anda siapkan? */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepBigTitle}>Berapa budget yang Anda siapkan?</Text>
            <Text style={styles.stepSubtitle}>Masukkan budget yang sesuai</Text>

            <View style={styles.budgetDisplayBox}>
              <Text style={styles.currencyPrefix}>Rp</Text>
              <TextInput
                style={styles.budgetAmountInput}
                value={Number(rawBudget).toLocaleString('id-ID')}
                onChangeText={(t) => setRawBudget(t.replace(/\D/g, ''))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Budget Dapat Ditingkatkan / Nego</Text>
              <Switch
                value={isNego}
                onValueChange={setIsNego}
                trackColor={{ false: COLORS.border, true: COLORS.warmYellow }}
              />
            </View>
          </View>
        )}

        {/* Step 4/6: Kapan task ini dibutuhkan? (Interactive Date & Duration) */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepBigTitle}>Kapan task ini dibutuhkan?</Text>
            <Text style={styles.stepSubtitle}>Pilih tanggal dan estimasi durasi</Text>

            <Text style={styles.fieldLabel}>Opsi Tanggal</Text>
            <View style={styles.optionsChipRow}>
              {DATE_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.optionChip, dateText === d && styles.optionChipSelected]}
                  onPress={() => setDateText(d)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionChipText, dateText === d && styles.optionChipTextSelected]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Estimasi Durasi Pengerjaan</Text>
            <View style={styles.optionsChipGrid}>
              {DURATION_OPTIONS.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[styles.optionChip, duration === dur && styles.optionChipSelected]}
                  onPress={() => setDuration(dur)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionChipText, duration === dur && styles.optionChipTextSelected]}>
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 5/6: Tambahkan foto (opsional) */}
        {currentStep === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepBigTitle}>Tambahkan foto (opsional)</Text>
            <Text style={styles.stepSubtitle}>
              Foto membantu helper memahami task Anda
            </Text>

            <TouchableOpacity style={styles.dashedAddPhotoBox} onPress={handlePickPhoto} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={32} color="#0B0B0B" style={{ marginBottom: 4 }} />
              <Text style={styles.addPhotoTitle}>Tambah Foto</Text>
              <Text style={styles.addPhotoSub}>Maks. 5 foto</Text>
            </TouchableOpacity>

            <View style={styles.thumbGalleryRow}>
              {photos.map((url, idx) => (
                <View key={idx} style={styles.thumbBox}>
                  <Image source={{ uri: url }} style={styles.thumbImage} />
                  <TouchableOpacity
                    style={styles.deleteBadge}
                    onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Step 6: Review & Finalize */}
        {currentStep === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepBigTitle}>Ringkasan Task</Text>
            <Text style={styles.stepSubtitle}>Periksa kembali data sebelum dipublikasikan</Text>

            <View style={styles.reviewSummaryBox}>
              <Text style={styles.reviewTitleText}>{title || 'Bersihkan Rumah'}</Text>
              <Text style={styles.reviewPriceText}>Rp {Number(rawBudget).toLocaleString('id-ID')}</Text>
              <Text style={styles.reviewAddressText}>📍 {address || 'Bekasi Timur'}</Text>
              <Text style={styles.reviewMetaText}>
                🗓️ {dateText} • ⏱️ {duration} • 🏷️ {categories.find(c => c.id === selectedCategoryId)?.name || 'Kebersihan'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Navigation Controls */}
      <View style={styles.stickyBottomBar}>
        <Button
          title={currentStep === totalSteps ? 'Publikasikan Task 🚀' : 'Lanjutkan ➔'}
          onPress={handleNextStep}
          loading={loading}
          style={styles.primaryActionBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  backBtn: { padding: 4 },
  wizardTitle: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary },
  stepCounterText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textSecondary },

  progressBarRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: 4,
    marginVertical: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.warmYellow,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  stepContainer: {
    marginTop: SPACING.md,
  },
  stepBigTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },

  inputWrapper: { position: 'relative' },
  textAreaInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCounterText: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 11,
    color: COLORS.slate400,
  },

  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  categoryChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipPillSelected: {
    backgroundColor: COLORS.warmYellow,
    borderColor: COLORS.warmYellow,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: '900',
  },

  mapCardContainer: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  floatingLocationPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: COLORS.warmYellow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingLocationPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addressInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  addressTextInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },

  budgetDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    height: 70,
    marginBottom: SPACING.md,
  },
  currencyPrefix: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  budgetAmountInput: {
    flex: 1,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  optionsChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  optionsChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipSelected: {
    backgroundColor: COLORS.warmYellow,
    borderColor: COLORS.warmYellow,
  },
  optionChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  optionChipTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: '900',
  },

  dashedAddPhotoBox: {
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.warmYellow,
    backgroundColor: COLORS.warmYellowBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addPhotoTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addPhotoSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  thumbGalleryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    position: 'relative',
  },
  thumbImage: { width: '100%', height: '100%', borderRadius: 12 },
  deleteBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  reviewSummaryBox: {
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewTitleText: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  reviewPriceText: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.blue600, marginBottom: 8 },
  reviewAddressText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: 4 },
  reviewMetaText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textPrimary },

  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.warmYellow,
    borderRadius: 16,
    height: 50,
  },
});
