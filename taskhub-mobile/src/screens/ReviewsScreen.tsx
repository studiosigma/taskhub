import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { reviewsApi } from '../services';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Text } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import type { RootStackParamList } from '../types';

export const ReviewsScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Reviews">> = ({ navigation }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await reviewsApi.getByUser(user.id);
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchReviews(); }, [fetchReviews]));

  return (
    <ScreenLayout title="Rating & Ulasan" onBack={() => navigation.goBack()}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewerName}>{item.reviewer.fullName}</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name={s <= item.rating ? 'star' : 'star-outline'} size={16} color={COLORS.primary} />
              ))}
            </View>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        )}
        ListEmptyComponent={!loading ? <EmptyState title="Belum ada ulasan" /> : null}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  reviewCard: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm, ...SHADOWS.sm },
  reviewerName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  stars: { flexDirection: 'row', marginVertical: 4 },
  comment: { fontSize: 13, color: COLORS.textSecondary },
});
