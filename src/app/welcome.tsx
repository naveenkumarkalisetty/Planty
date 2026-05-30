import { View, Text, StatusBar, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-emerald-950 items-center justify-center px-8">
      <StatusBar barStyle="light-content" backgroundColor="#022c22" />

      {/* Top Decoration */}
      <View className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10" />

      {/* Content */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} className="items-center mb-16">
        <Image 
          source={require('../../assets/images/icon.png')} 
          className="w-32 h-32 mb-6"
          resizeMode="contain"
        />
        <Text className="text-xl text-emerald-400 font-medium">Welcome to</Text>
        <Text className="text-5xl font-black text-emerald-50 tracking-widest mt-1">
          AyurVision
        </Text>
        <Text className="text-base text-emerald-300 text-center leading-relaxed mt-6 px-4">
          Discover the healing power of Ayurveda with AI. Scan any medicinal plant and get instant insights about its benefits.
        </Text>
      </Animated.View>

      {/* CTA Button */}
      <Animated.View entering={FadeInDown.delay(600).duration(600)} className="absolute bottom-16 left-8 right-8">
        <TouchableOpacity
          className="bg-emerald-400 py-4 rounded-full items-center shadow-lg shadow-green-500/40"
          activeOpacity={0.8}
          onPress={() => router.push("/onboarding")}
        >
          <Text className="text-lg font-bold text-emerald-950">Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
