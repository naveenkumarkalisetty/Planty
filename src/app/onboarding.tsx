import { useRef, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    emoji: "📸",
    title: "Identify Plants Instantly",
    description:
      "Scan any medicinal plant and get accurate results using AI technology. Our model recognizes 35+ Ayurvedic plants.",
  },
  {
    id: "2",
    emoji: "🌿",
    title: "Get Ayurvedic Insights",
    description:
      "Learn about medicinal benefits, traditional uses, and plant parts used in Ayurvedic medicine — all powered by on-device AI.",
  },
  {
    id: "3",
    emoji: "📋",
    title: "Track Your Collection",
    description:
      "Save your scanned plants, build your personal herbarium, and keep a history of every plant you've discovered.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("/login");
    }
  };

  const handleSkip = () => {
    router.replace("/login");
  };

  const renderSlide = ({ item }: { item: (typeof SLIDES)[0] }) => (
    <View className="items-center justify-center px-10 pt-24" style={{ width: SCREEN_W }}>
      <View className="w-36 h-36 rounded-full bg-emerald-400/10 items-center justify-center mb-10 border-2 border-emerald-400/20">
        <Text className="text-6xl">{item.emoji}</Text>
      </View>
      <Text className="text-3xl font-extrabold text-emerald-50 text-center mb-4">
        {item.title}
      </Text>
      <Text className="text-base text-emerald-300 text-center leading-relaxed">
        {item.description}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-emerald-950">
      <StatusBar barStyle="light-content" backgroundColor="#022c22" />

      {/* Skip Button */}
      <TouchableOpacity 
        className="absolute top-14 right-6 z-10 py-2 px-4"
        onPress={handleSkip}
      >
        <Text className="text-base text-emerald-400 font-semibold">Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setCurrentIndex(idx);
        }}
        className="flex-1"
      />

      {/* Dots + Next Button */}
      <Animated.View 
        entering={FadeInDown.delay(300).duration(500)} 
        className="px-8 pb-16 items-center space-y-8"
      >
        {/* Dots */}
        <View className="flex-row space-x-2 mb-8">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === currentIndex ? "w-6 bg-emerald-400" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity
          className="bg-emerald-400 py-4 px-20 rounded-full shadow-lg shadow-green-500/40"
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <Text className="text-lg font-bold text-emerald-950">
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
