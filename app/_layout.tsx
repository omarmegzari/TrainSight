// app/_layout.tsx

import { Stack } from 'expo-router';
import { LanguageProvider } from '../src/context/LanguageContext'; // Adjust path if needed

export default function RootLayout() {
  return (
    // MODIFICATION: Wrap the entire navigator with our provider.
    // Now, every screen in the app can access the language context.
    <LanguageProvider>
      <Stack>
        {/* The (tabs) screen refers to the group of tab screens */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Define the Settings screen as a page in the stack */}
        <Stack.Screen 
            name="settings" 
            options={{ 
                presentation: 'modal', // Or 'card' for a standard push animation
                headerShown: false, // We'll use a custom header in the screen itself
            }} 
        />
      </Stack>
    </LanguageProvider>
  );
}
