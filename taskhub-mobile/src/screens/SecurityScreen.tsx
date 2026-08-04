import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import type { RootStackParamList } from '../types';

export const SecurityScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Security">> = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
        toast.show({type: 'error', title: 'Error', message: 'Password harus min 6 karakter'});
        return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        toast.show({type: 'success', title: 'Berhasil', message: 'Password berhasil diubah'});
        navigation.goBack();
    }, 1500);
  };

  return (
    <ScreenLayout title="Keamanan & Privasi" onBack={() => navigation.goBack()}>
      <TextInput style={styles.input} placeholder="Password Lama" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
      <TextInput style={styles.input} placeholder="Password Baru" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <Button title="Ubah Password" onPress={handleUpdatePassword} loading={loading} />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
});
