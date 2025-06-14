import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './(tabs)/index';
import AnotherScreen from './(tabs)/two';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Tab.Screen name="Another" component={AnotherScreen} />
    </Tab.Navigator>
  );
}
