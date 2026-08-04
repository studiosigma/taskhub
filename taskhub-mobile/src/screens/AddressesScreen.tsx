import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../constants';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import type { RootStackParamList } from '../types';

export const AddressesScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Addresses">> = ({ navigation }) => {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [addresses, setAddresses] = useState<{ id: string; label: string; address: string }[]>([]);

  const handleAddAddress = () => {
    if (!label || !address) return;
    setAddresses([...addresses, { id: Date.now().toString(), label, address }]);
    setLabel('');
    setAddress('');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <ScreenLayout title="Alamat Saya" onBack={() => navigation.goBack()}>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Label (Contoh: Rumah)" value={label} onChangeText={setLabel} />
        <TextInput style={styles.input} placeholder="Alamat lengkap" value={address} onChangeText={setAddress} />
        <Button title="Tambah Alamat" onPress={handleAddAddress} />
      </View>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.addressCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.address}>{item.address}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="Belum ada alamat" />}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  form: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  addressCard: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.sm },
  label: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  address: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});
