import { generateChatResponse, initializeLLM } from "@/services/llmService";
import { RNLlamaOAICompatibleMessage } from "llama.rn";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  type CameraRef,
} from "react-native-vision-camera";
import {
  detectPlant,
  warmUpModel,
  type DetectionResult,
} from "../../services/plantDetector";
import { saveScan } from "../../services/api";

const { height: SCREEN_H } = Dimensions.get("window");

export default function ScanScreen() {
  // ─── Camera ──────────────────────────────────────────────────────
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<CameraRef>(null);
  const photoOutput = usePhotoOutput();

  // ─── State ───────────────────────────────────────────────────────
  const [isModelReady, setIsModelReady] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [messages, setMessages] = useState<RNLlamaOAICompatibleMessage[]>([
    { role: "system", content: "You are AyurVision, a concise AI plant care assistant. You provide medical benefits of the plant based of given scientific name or common name." },
  ]);

  // ─── Animations ──────────────────────────────────────────────────
  const resultSlide = useRef(new Animated.Value(SCREEN_H)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ─── Warm up the ML model on mount ───────────────────────────────
  useEffect(() => {
    warmUpModel()
      .then(() => setIsModelReady(true))
      .catch((e) => {
        console.error("Model warmup failed:", e);
        setError("Failed to load plant recognition model.");
      });

    initializeLLM().catch(console.error);
  }, []);

  // ─── Pulse animation for the shutter button ──────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // ─── Save Scan ───────────────────────────────────────────────────
  const handleSaveScan = async () => {
    if (!result || isSaving || isSaved) return;
    try {
      setIsSaving(true);
      const name = result.plantInfo?.commonName || result.scientificName;
      await saveScan(name, result.confidence, result.topPredictions || []);
      setIsSaved(true);
    } catch (err) {
      console.error("[Scan] Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Show result card ────────────────────────────────────────────
  const showResults = useCallback(
    async (res: DetectionResult) => {
      const isNone = res.scientificName.toLowerCase() === "none" || res.scientificName.toLowerCase() === "background" || res.scientificName.toLowerCase() === "unknown";
      
      const promptText = isNone
        ? "The scanner returned 'none' or 'unknown' for this image. Please politely tell the user: 'I cannot process the image properly, or maybe that is not a plant.'"
        : `Tell me the benefits of plant ${res.scientificName}`;

      const newMessages: RNLlamaOAICompatibleMessage[] = [
        ...messages,
        { role: "user", content: promptText }
      ];

      let full_ai_response = "";
      setMessages([...newMessages, { role: 'assistant', content: full_ai_response }]);

      setResult(res);
      setIsSaved(false);
      
      Animated.spring(resultSlide, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 120,
      }).start();
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (isNone) return;

      (async () => {
        try {
          await generateChatResponse(newMessages, (token) => {
            full_ai_response = full_ai_response + token;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: full_ai_response };
              return updated;
            });
          });
        } catch (err) {
          console.error("[LLM] Generation failed:", err);
          setError("Failed to get plant information.");
        }
      })();
    },
    [resultSlide, fadeAnim, messages]
  );

  // ─── Hide result card ────────────────────────────────────────────
  const hideResults = useCallback(() => {
    Animated.timing(resultSlide, {
      toValue: SCREEN_H,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setResult(null);
      setError(null);
      setIsSaved(false);
    });
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [resultSlide, fadeAnim]);

  // ─── Capture + Detect ────────────────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (!photoOutput || !isModelReady || isAnalysing) return;

    try {
      setIsAnalysing(true);
      setError(null);

      const photo = await photoOutput.capturePhoto({}, {});
      const filePath = await photo.saveToTemporaryFileAsync();
      photo.dispose();

      const detection = await detectPlant(filePath);

      if (detection) {
        showResults(detection);
      } else {
        setError("Could not identify the plant. Try moving closer or ensuring good lighting.");
      }
    } catch (e: any) {
      console.error("[Camera] Capture error:", e);
      setError(e.message || "Something went wrong.");
    } finally {
      setIsAnalysing(false);
    }
  }, [photoOutput, isModelReady, isAnalysing, showResults]);

  // ════════════════════════════════════════════════════════════════
  // PERMISSION SCREEN
  // ════════════════════════════════════════════════════════════════
  if (!hasPermission) {
    return (
      <View className="flex-1 bg-emerald-950 items-center justify-center px-8">
        <StatusBar barStyle="light-content" backgroundColor="#022c22" />
        <Text className="text-6xl mb-6">📸</Text>
        <Text className="text-3xl font-extrabold text-emerald-50 text-center mb-3">Camera Access Needed</Text>
        <Text className="text-base text-emerald-300 text-center leading-relaxed mb-8">
          AyurVision needs your camera to identify Ayurvedic plants and show their benefits.
        </Text>
        <TouchableOpacity
          className="bg-emerald-400 py-4 px-12 rounded-full shadow-lg shadow-green-500/40"
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text className="text-lg font-bold text-emerald-950">Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 bg-emerald-950 items-center justify-center px-8">
        <StatusBar barStyle="light-content" backgroundColor="#022c22" />
        <Text className="text-6xl mb-6">❌</Text>
        <Text className="text-3xl font-extrabold text-emerald-50 mb-3">No Camera Found</Text>
        <Text className="text-base text-emerald-300 text-center">
          This device does not have a camera available.
        </Text>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // MAIN VIEW
  // ════════════════════════════════════════════════════════════════
  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!result}
        outputs={[photoOutput]}
      />

      {/* Top Bar */}
      <View className="absolute top-0 left-0 right-0 pt-14 px-5 pb-4 flex-row justify-between items-center bg-black/40">
        <View className="flex-row items-center space-x-2">
          <Text className="text-2xl">🌿</Text>
          <Text className="text-xl font-extrabold text-emerald-50 tracking-wide">AyurVision</Text>
        </View>
        <View className="flex-row items-center bg-white/10 py-1.5 px-3 rounded-full space-x-2">
          <View className={`w-2 h-2 rounded-full ${isModelReady ? "bg-emerald-400" : "bg-amber-400"}`} />
          <Text className="text-xs font-semibold text-emerald-50">
            {isModelReady ? "AI Ready" : "Loading AI..."}
          </Text>
        </View>
      </View>

      {/* Crosshair */}
      <View className="absolute inset-0 items-center justify-center pointer-events-none">
        <View className="w-64 h-64 relative border-4 border-emerald-400/40 rounded-3xl" />
        <Text className="mt-6 text-sm font-semibold text-white/80 tracking-wide drop-shadow-md text-center">
          Point at a plant & tap the shutter
        </Text>
      </View>

      {/* Shutter */}
      {!result && (
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              className={`w-20 h-20 rounded-full bg-white/95 items-center justify-center border-4 border-emerald-400 shadow-xl shadow-green-500/50 ${(!isModelReady || isAnalysing) ? 'opacity-50' : ''}`}
              onPress={handleCapture}
              disabled={!isModelReady || isAnalysing}
              activeOpacity={0.7}
            >
              {isAnalysing ? (
                <ActivityIndicator size="large" color="#022c22" />
              ) : (
                <View className="w-14 h-14 rounded-full bg-emerald-400" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Analysing Overlay */}
      {isAnalysing && (
        <View className="absolute inset-0 bg-emerald-950/80 items-center justify-center">
          <View className="bg-white/10 p-8 rounded-3xl items-center border border-emerald-400/30">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-xl font-bold text-emerald-50 mt-4">Analysing plant...</Text>
            <Text className="text-sm text-emerald-300 mt-2">Running AI model on device</Text>
          </View>
        </View>
      )}

      {/* Error */}
      {error && !result && (
        <View className="absolute bottom-36 left-5 right-5">
          <View className="bg-zinc-900/95 rounded-2xl p-5 items-center border border-amber-400/30">
            <Text className="text-3xl mb-2">🔍</Text>
            <Text className="text-sm text-amber-400 text-center mb-3 leading-relaxed">{error}</Text>
            <TouchableOpacity onPress={() => setError(null)} className="bg-amber-400/20 py-2 px-6 rounded-full">
              <Text className="text-sm font-semibold text-amber-400">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Result Card */}
      {result && (
        <>
          <Animated.View style={[{ opacity: fadeAnim }]} className="absolute inset-0 bg-black/60 pointer-events-auto">
            <TouchableOpacity className="absolute inset-0" onPress={hideResults} activeOpacity={1} />
          </Animated.View>

          <Animated.View 
            style={[
              { transform: [{ translateY: resultSlide }] },
              { maxHeight: SCREEN_H * 0.85 }
            ]} 
            className="absolute bottom-0 left-0 right-0 bg-[#0f3d23] rounded-t-[32px] border-t border-emerald-400/30 shadow-2xl"
          >
            <ScrollView showsVerticalScrollIndicator={false} bounces={true} contentContainerClassName="p-6 pb-12">
              <View className="w-10 h-1 rounded-full bg-white/30 self-center mb-5" />

              <View className="flex-row items-start space-x-4 mb-5">
                <Text className="text-5xl">{result.plantInfo?.emoji || "🌱"}</Text>
                <View className="flex-1">
                  <Text className="text-3xl font-extrabold text-emerald-50 leading-tight">
                    {result.plantInfo?.commonName || result.scientificName}
                  </Text>
                  <Text className="text-sm italic text-emerald-300 mt-1">{result.scientificName}</Text>
                  {result.plantInfo?.family && (
                    <Text className="text-xs text-emerald-400 mt-1">Family: {result.plantInfo.family}</Text>
                  )}
                </View>
              </View>

              <View className="flex-row mb-5">
                <View className={`py-1.5 px-4 rounded-full ${result.confidence > 0.7 ? "bg-emerald-400/20" : result.confidence > 0.4 ? "bg-amber-400/20" : "bg-red-400/20"}`}>
                  <Text className="text-sm font-bold text-emerald-400">{(result.confidence * 100).toFixed(1)}% match</Text>
                </View>
              </View>

              {result.plantInfo && (
                <>
                  <Text className="text-xl font-bold text-emerald-50 mt-2 mb-3">💊 Medicinal Benefits</Text>
                  <View className="space-y-2 mb-4">
                    {result.plantInfo.benefits.map((benefit, i) => (
                      <View key={i} className="bg-emerald-400/10 rounded-xl py-3 px-4 border border-emerald-400/15">
                        <Text className="text-sm text-emerald-100 leading-relaxed">✦ {benefit}</Text>
                      </View>
                    ))}
                  </View>

                  <Text className="text-xl font-bold text-emerald-50 mb-3">🧪 Traditional Uses</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {result.plantInfo.uses.map((use, i) => (
                      <View key={i} className="bg-purple-500/15 rounded-full py-2 px-4 border border-purple-500/25">
                        <Text className="text-xs font-semibold text-purple-300">{use}</Text>
                      </View>
                    ))}
                  </View>

                  <Text className="text-xl font-bold text-emerald-50 mb-3">🌿 Plant Parts Used</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {result.plantInfo.parts.map((part, i) => (
                      <View key={i} className="bg-blue-500/15 rounded-full py-2 px-4 border border-blue-500/25">
                        <Text className="text-xs font-semibold text-blue-300">{part}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* AI Insight */}
              {!result.plantInfo && result.scientificName.toLowerCase() !== "unknown" && (
                <View className="bg-emerald-500/5 rounded-2xl p-5 mt-2 border border-emerald-500/15">
                  <Text className="text-xl font-bold text-emerald-50 mb-2">✨ AI Plant Analysis</Text>
                  {messages.length > 1 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content ? (
                    <Text className="text-base text-emerald-200 leading-relaxed mt-2">
                      {messages[messages.length - 1].content as string}
                    </Text>
                  ) : (
                    <View className="flex-row items-center space-x-3 mt-3">
                      <ActivityIndicator color="#10b981" size="small" />
                      <Text className="text-sm font-semibold text-emerald-400 italic">Generating insights...</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Top 5 for low confidence / unknown */}
              {result.scientificName.toLowerCase() === "unknown" && result.topPredictions && (
                <View className="bg-emerald-500/5 rounded-2xl p-5 mt-2 border border-emerald-500/15">
                  <Text className="text-xl font-bold text-emerald-50 mb-2">Not quite sure...</Text>
                  <Text className="text-sm text-emerald-300 mb-4">I couldn't identify this plant confidently. Here are my top guesses:</Text>
                  <View className="space-y-2">
                    {result.topPredictions.map((pred, i) => (
                      <View key={i} className="flex-row justify-between bg-white/5 p-3 rounded-xl">
                        <Text className="text-base font-semibold text-emerald-50">{pred.label}</Text>
                        <Text className="text-base font-semibold text-emerald-400">{(pred.confidence * 100).toFixed(1)}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row space-x-3 mt-8">
                <TouchableOpacity
                  className="flex-1 bg-white/10 py-4 rounded-full items-center border border-white/20"
                  onPress={hideResults}
                  activeOpacity={0.8}
                >
                  <Text className="text-base font-bold text-emerald-50">Scan Again</Text>
                </TouchableOpacity>

                {result.scientificName.toLowerCase() !== "unknown" && (
                  <TouchableOpacity
                    className={`flex-1 py-4 rounded-full items-center shadow-lg shadow-green-500/30 ${isSaved ? "bg-emerald-600" : "bg-emerald-400"}`}
                    onPress={handleSaveScan}
                    disabled={isSaving || isSaved}
                    activeOpacity={0.8}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#022c22" />
                    ) : (
                      <Text className={`text-base font-bold ${isSaved ? "text-emerald-50" : "text-emerald-950"}`}>
                        {isSaved ? "Saved!" : "Save to History"}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Text className="text-xs text-emerald-300/60 text-center mt-6 leading-relaxed">
                ⚠️ For educational purposes only. Always consult a qualified practitioner before using any plant medicinally.
              </Text>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}
