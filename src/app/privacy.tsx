import { View, Text, StatusBar, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PrivacyScreen() {
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
        <Text className="text-2xl font-extrabold dark:text-emerald-50 text-emerald-950">Privacy Policy</Text>
      </View>

      <ScrollView contentContainerClassName="p-5 pb-12">
        <Text className="text-sm dark:text-emerald-300 text-emerald-700 mb-6 font-medium">
          Last Updated: {new Date().toLocaleDateString()}
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">1. Information We Collect</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          We collect information you provide directly to us, such as your name, email address, and photos of plants you choose to scan using AyurVision.
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">2. How We Use Information</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          We use the information we collect to provide, maintain, and improve our services, including identifying plants using our on-device AI models.
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">3. Data Storage & Security</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          Your scan history and personal data are securely stored. Plant identification primarily happens locally on your device for enhanced privacy and speed.
        </Text>

        <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 mb-3">4. Contact Us</Text>
        <Text className="text-base dark:text-emerald-200 text-emerald-800 leading-relaxed mb-6">
          If you have any questions about this Privacy Policy, please contact us at privacy@ayurvision.com.
        </Text>
      </ScrollView>
    </View>
  );
}
