import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useColorScheme } from 'nativewind';
import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme()

  async function toggleTheme() {
    const newTheme = colorScheme == 'dark' ? 'light' : 'dark'
    setColorScheme(newTheme)
    await AsyncStorage.setItem('theme', newTheme)
  }

  return (
    <View className="flex-1 bg-white dark:bg-emerald-950">
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <View className="flex-row items-center pt-16 px-5 pb-4 border-b border-black/5 dark:border-white/5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-50">Settings</Text>
      </View>

      <ScrollView contentContainerClassName="p-5 space-y-8">
        {/* Preferences */}
        <View>
          <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 ml-1 uppercase tracking-wider">
            Preferences
          </Text>
          <View className="bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
            <View className="flex-row items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <View className="flex-row items-center space-x-3">
                <View className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 items-center justify-center mr-3">
                  <Ionicons name="moon" size={16} color="#10b981" />
                </View>
                <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">Dark Mode</Text>
              </View>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: "#d1d5db", true: "#10b981" }}
                thumbColor={colorScheme === 'dark' ? "#022c22" : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View>
          <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 ml-1 uppercase tracking-wider">
            About
          </Text>
          <View className="bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-black/5 dark:border-white/5" onPress={() => router.push("/privacy")}>
              <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} className="color-black/20 dark:color-white/20" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-black/5 dark:border-white/5" onPress={() => router.push("/terms")}>
              <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} className="color-black/20 dark:color-white/20" />
            </TouchableOpacity>
            <View className="flex-row items-center justify-between p-4">
              <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">App Version</Text>
              <Text className="text-sm text-emerald-700 dark:text-emerald-300 font-bold">v1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
