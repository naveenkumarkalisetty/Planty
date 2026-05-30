import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter } from "react-native";
import "../../global.css";
import { getToken } from "../services/api";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isNewDevice, setIsNewDevice] = useState(true);
  const router = useRouter();

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setColorScheme(savedTheme);
      } else {
        setColorScheme("dark"); // Default theme
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  }, [setColorScheme]);

  const checkAuth = useCallback(async () => {
    try {
      const token = await getToken();
      const newDevice = await AsyncStorage.getItem('isNewDevice')
      if (newDevice == null) {
        await AsyncStorage.setItem('isNewDevice', 'true')
      } else {
        await AsyncStorage.setItem('isNewDevice', 'false')
        setIsNewDevice(false)
      }
      setIsLoggedIn(!!token);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    loadTheme();
    checkAuth();

    const subscription = DeviceEventEmitter.addListener("authStateChanged", checkAuth);
    return () => {
      subscription.remove();
    };
  }, [loadTheme, checkAuth]);


  if (!isReady) {
    return <ActivityIndicator size="large" color="#10b981" className="flex-1 items-center justify-center bg-emerald-950 dark:bg-emerald-950" />
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="help" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="personal-info" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        {/* If New Device, Welcome is first (Initial Route) */}
        {isNewDevice && <Stack.Screen name="welcome" />}
        {isNewDevice && <Stack.Screen name="onboarding" />}
        
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />

        {/* If Returning Device, Welcome and Onboarding are pushed to the back */}
        {!isNewDevice && <Stack.Screen name="welcome" />}
        {!isNewDevice && <Stack.Screen name="onboarding" />}
      </Stack.Protected>
    </Stack>
  );
}
