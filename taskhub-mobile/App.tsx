import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './src/hooks/useAuth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/ui/Toast';

const AppContent: React.FC = () => {
  const { hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, []);

  return <AppNavigator />;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter: require('./assets/fonts/Inter-VariableFont.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <ActivityIndicator size="large" color="#FFCA27" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
          <AppContent />
          <StatusBar style="dark" />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
