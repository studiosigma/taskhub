import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
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

import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.textPrimary,
      tabBarInactiveTintColor: '#A1A1AA',
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        paddingBottom: 6,
        paddingTop: 6,
        height: 68,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 8,
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
        tabBarIcon: () => (
          <View style={navStyles.fabButton}>
            <Ionicons name="add" size={28} color="#0B0B0B" />
          </View>
        ),
      }}
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

const navStyles = StyleSheet.create({
  fabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.warmYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, activeRole, isLoading } = useAuth();
  const hasChosenRole = !!activeRole;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="briefcase" size={32} color={COLORS.warmYellow} style={{ marginBottom: 12 }} />
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
        </>
      )}
    </Stack.Navigator>
  );
};
