import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function HelpScreen() {
  const router = useRouter();

  const faqs = [
    {
      q: "How accurate is the plant detection?",
      a: "Our AI model is trained on thousands of Ayurvedic plants and typically achieves over 90% accuracy in good lighting.",
    },
    {
      q: "Can I use the app offline?",
      a: "Yes! Plant identification runs entirely on your device, so you don't need an internet connection to scan plants.",
    },
    {
      q: "How do I save a plant?",
      a: "After scanning a plant, you'll see a 'Save' button on the results screen. Tap it to add the plant to your history.",
    },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-emerald-950">
      <StatusBar barStyle="light-content" backgroundColor="#022c22" />

      {/* Header */}
      <View className="flex-row items-center pt-16 px-5 pb-4 border-b border-black/5 dark:border-white/5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-50">Help & Support</Text>
      </View>

      <ScrollView contentContainerClassName="p-5 space-y-15">

        {/* Contact Us */}
        <View>
          <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 ml-1 uppercase tracking-wider">
            Contact Us
          </Text>
          <View className="bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
            <View className="flex-row items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <View className="flex-row items-center space-x-3">
                <View className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 items-center justify-center">
                  <Ionicons name="mail" size={16} color="#10b981" />
                </View>
                <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">Email Support</Text>
              </View>
              <Text className="text-base text-emerald-600 dark:text-emerald-400">ayurvision@gmail.com</Text>
            </View>
          </View>
        </View>

        {/* FAQs */}
        <View>
          <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 ml-1 uppercase tracking-wider">
            Frequently Asked Questions
          </Text>
          <View className="space-y-3">
            {faqs.map((faq, index) => (
              <View key={index} className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5">
                <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50 mb-2">{faq.q}</Text>
                <Text className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">{faq.a}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
