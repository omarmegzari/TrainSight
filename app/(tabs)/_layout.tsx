import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hides the top header bar
        tabBarStyle: { display: 'none' }, // Hides the bottom tab bar
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // You can still navigate here programmatically, but it won't appear in the UI
          title: 'Hidden Tab One',
          href: null, // Optional: prevent it from appearing in the router
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Hidden Tab Two',
          href: null, // Optional
        }}
      />
    </Tabs>
  );
}
