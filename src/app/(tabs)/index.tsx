import { generateChatResponse, initializeLLM } from "@/services/llmService";
import { RNLlamaOAICompatibleMessage } from "llama.rn";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function Index() {
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
  const [messages, setMessages] = useState<RNLlamaOAICompatibleMessage[]>([
    { role: "system", content: "You are Planty, a concise AI plant care assistant. You provide medical benefits of the plant based of given scientific name or common name." },
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

    initializeLLM().catch(console.error)
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

  // ─── Show result card ────────────────────────────────────────────
  const showResults = useCallback(
    async (res: DetectionResult) => {
      const isNone = res.scientificName.toLowerCase() === "none" || res.scientificName.toLowerCase() === "background";
      const promptText = isNone
        ? "The scanner returned 'none' for this image. Please politely tell the user: 'I cannot process the image properly, or maybe that is not a plant.'"
        : `Tell me the benefits of plant ${res.scientificName}`;

      const newMessages: RNLlamaOAICompatibleMessage[] = [
        ...messages,
        { role: "user", content: promptText }
      ]

      let full_ai_response = ""
      setMessages([...newMessages, { role: 'assistant', content: full_ai_response }])

      // Show the slide up UI immediately
      setResult(res);
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

      // Run AI generation asynchronously without blocking the UI
      (async () => {
        try {
          await generateChatResponse(newMessages, (token) => {
            full_ai_response = full_ai_response + token
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: full_ai_response }
              return updated
            })
          })
        } catch (err) {
          console.error("[LLM] Generation failed:", err);
          setError("Failed to get plant information.");
        }
      })();
    },
    [resultSlide, fadeAnim]
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

      // 1. Capture photo
      console.log("[Camera] Capturing photo...");
      const photo = await photoOutput.capturePhoto({}, {});
      console.log(
        `[Camera] Photo captured: ${photo.width}×${photo.height}`
      );

      // 2. Save to temp file
      const filePath = await photo.saveToTemporaryFileAsync();
      console.log("[Camera] Saved to:", filePath);
      photo.dispose();

      // 3. Run detection
      const detection = await detectPlant(filePath);

      if (detection) {
        showResults(detection);
      } else {
        setError(
          "Could not identify the plant. Try moving closer or ensuring good lighting."
        );
      }
    } catch (e: any) {
      console.error("[Camera] Capture/detect error:", e);
      setError(e.message || "Something went wrong during detection.");
    } finally {
      setIsAnalysing(false);
    }
  }, [photoOutput, isModelReady, isAnalysing, showResults]);

  // ════════════════════════════════════════════════════════════════
  // PERMISSION SCREEN
  // ════════════════════════════════════════════════════════════════
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a2e1a" />
        <Text style={styles.permissionEmoji}>📸</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionBody}>
          Planty needs your camera to identify ayurvedic plants and show their
          medicinal benefits.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // NO DEVICE
  // ════════════════════════════════════════════════════════════════
  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a2e1a" />
        <Text style={styles.permissionEmoji}>❌</Text>
        <Text style={styles.permissionTitle}>No Camera Found</Text>
        <Text style={styles.permissionBody}>
          This device does not have a camera available.
        </Text>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // MAIN CAMERA VIEW
  // ════════════════════════════════════════════════════════════════
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ─── Camera Preview ────────────────────────────────────── */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!result}
        outputs={[photoOutput]}
      />

      {/* ─── Top Bar ───────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.appBadge}>
          <Text style={styles.appBadgeEmoji}>🌿</Text>
          <Text style={styles.appBadgeText}>Planty</Text>
        </View>
        <View style={styles.modelBadge}>
          <View
            style={[
              styles.modelDot,
              { backgroundColor: isModelReady ? "#4ade80" : "#fbbf24" },
            ]}
          />
          <Text style={styles.modelText}>
            {isModelReady ? "AI Ready" : "Loading AI..."}
          </Text>
        </View>
      </View>

      {/* ─── Crosshair / Guide ─────────────────────────────────── */}
      <View style={styles.crosshairContainer} pointerEvents="none">
        <View style={styles.crosshairBox}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={styles.guideText}>
          Point at a plant & tap the shutter
        </Text>
      </View>

      {/* ─── Shutter Button ────────────────────────────────────── */}
      {!result && (
        <View style={styles.bottomBar}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.shutterBtn,
                (!isModelReady || isAnalysing) && styles.shutterDisabled,
              ]}
              onPress={handleCapture}
              disabled={!isModelReady || isAnalysing}
              activeOpacity={0.7}
            >
              {isAnalysing ? (
                <ActivityIndicator size="large" color="#0a2e1a" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* ─── Analysing Overlay ─────────────────────────────────── */}
      {isAnalysing && (
        <View style={styles.analysingOverlay}>
          <View style={styles.analysingCard}>
            <ActivityIndicator size="large" color="#4ade80" />
            <Text style={styles.analysingText}>Analysing plant...</Text>
            <Text style={styles.analysingSubtext}>
              Running AI model on device
            </Text>
          </View>
        </View>
      )}

      {/* ─── Error Toast ───────────────────────────────────────── */}
      {error && !result && (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>🔍</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError(null)}
              style={styles.errorDismiss}
            >
              <Text style={styles.errorDismissText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── Result Card (Slide Up) ────────────────────────────── */}
      {result && (
        <>
          {/* Dimming backdrop */}
          <Animated.View
            style={[styles.backdrop, { opacity: fadeAnim }]}
            pointerEvents="auto"
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={hideResults}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[
              styles.resultCard,
              { transform: [{ translateY: resultSlide }] },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.resultScroll}
            >
              {/* Drag handle */}
              <View style={styles.dragHandle} />

              {/* Header */}
              <View style={styles.resultHeader}>
                <Text style={styles.resultEmoji}>
                  {result.plantInfo?.emoji || "🌱"}
                </Text>
                <View style={styles.resultHeaderText}>
                  <Text style={styles.resultName} numberOfLines={2}>
                    {result.plantInfo?.commonName || result.scientificName}
                  </Text>
                  <Text style={styles.resultScientific}>
                    {result.scientificName}
                  </Text>
                  {result.plantInfo?.family && (
                    <Text style={styles.resultFamily}>
                      Family: {result.plantInfo.family}
                    </Text>
                  )}
                </View>
              </View>

              {/* Confidence Badge */}
              <View style={styles.confidenceRow}>
                <View
                  style={[
                    styles.confidenceBadge,
                    result.confidence > 0.7
                      ? styles.confidenceHigh
                      : result.confidence > 0.4
                        ? styles.confidenceMedium
                        : styles.confidenceLow,
                  ]}
                >
                  <Text style={styles.confidenceText}>
                    {(result.confidence * 100).toFixed(1)}% match
                  </Text>
                </View>
              </View>

              {/* Medicinal Benefits */}
              {result.plantInfo && (
                <>
                  <Text style={styles.sectionTitle}>
                    💊 Medicinal Benefits
                  </Text>
                  <View style={styles.benefitsList}>
                    {result.plantInfo.benefits.map((benefit, i) => (
                      <View key={i} style={styles.benefitPill}>
                        <Text style={styles.benefitText}>✦ {benefit}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>🧪 Traditional Uses</Text>
                  <View style={styles.usesList}>
                    {result.plantInfo.uses.map((use, i) => (
                      <View key={i} style={styles.useChip}>
                        <Text style={styles.useChipText}>{use}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>🌿 Plant Parts Used</Text>
                  <View style={styles.usesList}>
                    {result.plantInfo.parts.map((part, i) => (
                      <View key={i} style={styles.partChip}>
                        <Text style={styles.partChipText}>{part}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Dynamic AI Info (Shown if no hardcoded Ayurvedic data is available) */}
              {!result.plantInfo && (
                <View style={styles.aiInfoCard}>
                  <Text style={styles.sectionTitle}>✨ AI Plant Analysis</Text>
                  {messages.length > 1 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content ? (
                    <Text style={styles.aiBodyText}>
                      {messages[messages.length - 1].content as string}
                    </Text>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <ActivityIndicator color="#4ade80" size="small" />
                      <Text style={styles.aiGeneratingText}>Generating insights...</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Scan Again Button */}
              <TouchableOpacity
                style={styles.scanAgainBtn}
                onPress={hideResults}
                activeOpacity={0.8}
              >
                <Text style={styles.scanAgainText}>🔄 Scan Another Plant</Text>
              </TouchableOpacity>

              {/* Disclaimer */}
              <Text style={styles.disclaimer}>
                ⚠️ This is for educational purposes only. Always consult a
                qualified practitioner before using any plant medicinally.
              </Text>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ─── Container ────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // ─── Permission Screen ────────────────────────────────────────
  permissionContainer: {
    flex: 1,
    backgroundColor: "#0a2e1a",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  permissionEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e0f2e9",
    textAlign: "center",
    marginBottom: 12,
  },
  permissionBody: {
    fontSize: 16,
    color: "#a3d9b8",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionBtn: {
    backgroundColor: "#4ade80",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    elevation: 4,
    shadowColor: "#4ade80",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  permissionBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a2e1a",
  },

  // ─── Top Bar ──────────────────────────────────────────────────
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(10, 46, 26, 0.6)",
  },
  appBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appBadgeEmoji: {
    fontSize: 24,
  },
  appBadgeText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#e0f2e9",
    letterSpacing: 0.5,
  },
  modelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  modelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e0f2e9",
  },

  // ─── Crosshair ────────────────────────────────────────────────
  crosshairContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairBox: {
    width: SCREEN_W * 0.65,
    height: SCREEN_W * 0.65,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#4ade80",
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  guideText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },

  // ─── Shutter Button ──────────────────────────────────────────
  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#4ade80",
    elevation: 8,
    shadowColor: "#4ade80",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4ade80",
  },

  // ─── Analysing Overlay ────────────────────────────────────────
  analysingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10, 46, 26, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  analysingCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  analysingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e0f2e9",
    marginTop: 16,
  },
  analysingSubtext: {
    fontSize: 13,
    color: "#a3d9b8",
    marginTop: 6,
  },

  // ─── Error Toast ──────────────────────────────────────────────
  errorContainer: {
    position: "absolute",
    bottom: 140,
    left: 20,
    right: 20,
  },
  errorCard: {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  errorEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#fbbf24",
    textAlign: "center",
    lineHeight: 20,
  },
  errorDismiss: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    borderRadius: 20,
  },
  errorDismissText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fbbf24",
  },

  // ─── Backdrop ─────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  // ─── Result Card ──────────────────────────────────────────────
  resultCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_H * 0.78,
    backgroundColor: "#0f3d23",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    borderTopWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
  },
  resultScroll: {
    padding: 24,
    paddingBottom: 48,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignSelf: "center",
    marginBottom: 20,
  },

  // Result Header
  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultHeaderText: {
    flex: 1,
  },
  resultName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#e0f2e9",
    lineHeight: 30,
  },
  resultScientific: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#a3d9b8",
    marginTop: 4,
  },
  resultFamily: {
    fontSize: 12,
    color: "#7bc4a0",
    marginTop: 2,
  },

  // Confidence
  confidenceRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  confidenceBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  confidenceHigh: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  confidenceMedium: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  confidenceLow: {
    backgroundColor: "rgba(248, 113, 113, 0.2)",
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4ade80",
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e0f2e9",
    marginTop: 20,
    marginBottom: 12,
  },

  // Benefits
  benefitsList: {
    gap: 8,
  },
  benefitPill: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.15)",
  },
  benefitText: {
    fontSize: 14,
    color: "#c8edd8",
    lineHeight: 20,
  },

  // Uses
  usesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  useChip: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.25)",
  },
  useChipText: {
    fontSize: 13,
    color: "#d8b4fe",
    fontWeight: "600",
  },
  partChip: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.25)",
  },
  partChipText: {
    fontSize: 13,
    color: "#93c5fd",
    fontWeight: "600",
  },

  // AI Info Card
  aiInfoCard: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  aiBodyText: {
    fontSize: 15,
    color: "#a3d9b8",
    lineHeight: 24,
    marginTop: 8,
  },
  aiGeneratingText: {
    fontSize: 14,
    color: "#4ade80",
    fontWeight: "600",
    fontStyle: "italic",
  },

  // Scan Again
  scanAgainBtn: {
    backgroundColor: "#4ade80",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 28,
    elevation: 4,
    shadowColor: "#4ade80",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  scanAgainText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0a2e1a",
  },

  // Disclaimer
  disclaimer: {
    fontSize: 11,
    color: "rgba(163, 217, 184, 0.6)",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
});
