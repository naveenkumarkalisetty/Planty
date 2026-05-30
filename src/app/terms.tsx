import { View, Text, StatusBar, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-emerald-950">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="flex-row items-center pt-14 px-5 pb-4 border-b dark:border-white/5 border-black/5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full dark:bg-white/5 bg-black/5 items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} className="dark:color-emerald-400 color-emerald-700" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold dark:text-emerald-50 text-emerald-950">Terms of Service</Text>
      </View>

      <ScrollView contentContainerClassName="p-5 pb-12">
        <Text className="text-sm dark:text-emerald-300 text-emerald-700 mb-6 font-medium">
          Last Updated: {new Date().toLocaleDateString()}
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">1. Educational Purposes Only</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          The information provided by AyurVision is for educational and informational purposes only. It does not constitute medical advice, diagnosis, or treatment.
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">2. Accuracy of Information</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          While we strive for high accuracy using our AI models, plant identification can sometimes be incorrect. Always consult a qualified botanical or medical professional before consuming or using any plant.
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">3. User Responsibilities</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          You are solely responsible for any actions you take based on the information provided by the app. Do not rely solely on AyurVision for identifying toxic or edible plants.
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">4. Changes to Terms</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          We reserve the right to modify these terms at any time. Your continued use of the app constitutes acceptance of those changes.
        </Text>
      </ScrollView>
    </View>
  );
}
