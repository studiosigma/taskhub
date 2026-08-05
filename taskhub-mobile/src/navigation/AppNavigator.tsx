import React, { useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import type { RootStackParamList, MainTabParamList } from '../types';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { CreateTaskScreen } from '../screens/CreateTaskScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatDetailScreen } from '../screens/ChatDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MyTasksScreen } from '../screens/MyTasksScreen';
import { IdentityVerificationScreen } from '../screens/IdentityVerificationScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { AddressesScreen } from '../screens/AddressesScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { FinancialDashboardScreen } from '../screens/FinancialDashboardScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const FAB: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const pulse = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true, damping: 8, stiffness: 200 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 150 }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Animated.View style={[navStyles.fabShadow, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[navStyles.fabButton, { transform: [{ rotate: rotation }] }]}>
        <Ionicons name="add" size={28} color={COLORS.textPrimary} />
      </Animated.View>
    </Animated.View>
  );
};

const HomeTabs: React.FC = () => {
  const fabRef = useRef<Animated.Value>(new Animated.Value(1));

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: COLORS.slate400,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 68,
          ...SHADOWS.md,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <FAB />,
        }}
        listeners={({ navigation, route }) => ({
          tabPress: () => {
            // FAB already handles animation
          },
        })}
      />
      <Tab.Screen
        name="Inbox"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const navStyles = StyleSheet.create({
  fabShadow: {
    marginBottom: 12,
  },
  fabButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
});

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, activeRole, isLoading } = useAuth();
  const hasChosenRole = !!activeRole;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="briefcase" size={32} color={COLORS.primary} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.textPrimary }}>TaskHub</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          {!hasChosenRole && <Stack.Screen name="Welcome" component={WelcomeScreen} />}
          <Stack.Screen name="MainTabs" component={HomeTabs} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="MyTasks" component={MyTasksScreen} />
          <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="Addresses" component={AddressesScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="FinancialDashboard" component={FinancialDashboardScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
