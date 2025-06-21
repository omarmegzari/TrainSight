import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

// You might need to adjust this path depending on where your 'constants' or 'components' are relative to _layout.tsx
// Assuming 'constants/Colors' is at the project root level.
import Colors from '../../constants/Colors'; // Adjusted path if needed
import { useColorScheme } from '../../components/useColorScheme'; // Adjusted path if needed

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
          title: 'Hidden Home', // A more descriptive title
          href: null, // Optional: prevent it from appearing in the router
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Hidden AR Screen', // A more descriptive title
          href: null, // Optional
        }}
      />
      {/* Add your new map screen here */}
      <Tabs.Screen
        name="map" // This matches the filename app/(tabs)/map.tsx
        options={{
          title: 'Hidden Map Screen', // A descriptive title
          href: null, // Keep it hidden from the tab bar UI
        }}
      />
    </Tabs>
  );
}