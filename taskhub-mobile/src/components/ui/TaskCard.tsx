import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import { Badge } from './Badge';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

const DUMMY_TASK_IMAGES: Record<string, string> = {
  kebersihan: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80',
  banjir: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80',
  antri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80',
  restoran: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80',
  driver: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80',
  kurir: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80',
  pindahan: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&q=80',
  pertukangan: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
  reparasi: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
  default: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&q=80',
};

const getDummyImage = (task: Task): string => {
  const text = `${task?.title || ''} ${task?.category?.name || ''}`.toLowerCase();
  if (text.includes('bersih') || text.includes('banjir') || text.includes('clean')) {
    return DUMMY_TASK_IMAGES.kebersihan;
  }
  if (text.includes('antri') || text.includes('restoran') || text.includes('makan')) {
    return DUMMY_TASK_IMAGES.antri;
  }
  if (text.includes('driver') || text.includes('antar') || text.includes('kurir') || text.includes('kirim')) {
    return DUMMY_TASK_IMAGES.driver;
  }
  if (text.includes('pindah') || text.includes('angkut') || text.includes('barang')) {
    return DUMMY_TASK_IMAGES.pindahan;
  }
  if (text.includes('tukang') || text.includes('reparasi') || text.includes('servis')) {
    return DUMMY_TASK_IMAGES.pertukangan;
  }
  return DUMMY_TASK_IMAGES.default;
};

const TaskCardComponent: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const formattedBudget = Number(task?.budget || 0).toLocaleString('id-ID');
  const mockDistance = task?.id ? (Math.floor((task.id.charCodeAt(0) % 3) + 1)) : 1;
  const dummyThumbnail = getDummyImage(task);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress(task)}
      activeOpacity={0.78}
    >
      {/* Left Column: Content */}
      <View style={styles.leftContent}>
        {/* Top Badges Row: Status + Distance */}
        <View style={styles.badgesRow}>
          <Badge status={task.status} size="sm" />
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={11} color="#64748B" style={{ marginRight: 3 }} />
            <Text style={styles.distanceText}>{mockDistance} km</Text>
          </View>
        </View>

        {/* Task Title */}
        <Text style={styles.title} numberOfLines={2}>
          {task?.title || 'Judul Task'}
        </Text>

        {/* Price Row (Warm Golden Yellow Accent) */}
        <View style={styles.priceRow}>
          <View style={styles.yellowPricePill}>
            <Text style={styles.priceValue}>Rp{formattedBudget}</Text>
            <Text style={styles.pricePerPerson}> / orang</Text>
          </View>
        </View>

        {/* Meta info: Duration & Address */}
        <View style={styles.metaRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={11} color="#64748B" style={{ marginRight: 3 }} />
            <Text style={styles.metaItem}>{task?.duration || '6 Jam'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="location-outline" size={11} color="#64748B" style={{ marginRight: 3 }} />
            <Text style={styles.metaItem} numberOfLines={1}>
              {task?.address ? task.address.split(',')[0] : 'Bekasi Timur'}
            </Text>
          </View>
        </View>

        {/* Category Badge Pill */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>
            {task?.category?.name || 'Lainnya'}
          </Text>
        </View>
      </View>

      {/* Right Column: High Quality Thumbnail Image */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: dummyThumbnail }}
          style={styles.thumbnailImage}
          transition={250}
          contentFit="cover"
        />
      </View>
    </TouchableOpacity>
  );
};

export const TaskCard = React.memo(TaskCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  verifiedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: '#0B0B0B',
    lineHeight: 20,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  yellowPricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFE185',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '900',
    color: '#0B0B0B',
  },
  pricePerPerson: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#0B0B0B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B0B0B',
  },
  thumbnailContainer: {
    width: 92,
    height: 92,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
});
