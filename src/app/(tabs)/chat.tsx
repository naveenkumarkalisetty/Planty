import { Ionicons } from "@expo/vector-icons";
import { RNLlamaOAICompatibleMessage } from "llama.rn";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateChatResponse, initializeLLM } from "../../services/llmService";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<RNLlamaOAICompatibleMessage[]>([
    { role: "system", content: "You are Planty, a concise AI plant care assistant. You provide instructions on watering, sunlight, and soil. Even if a plant has medicinal uses (like Tulsi), you MUST answer the botanical care questions. Do not give medical disclaimers." },
  ]);
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Preload LLM on mount
  useEffect(() => {
    initializeLLM().catch(console.error);
    
    // Manual keyboard tracking for Android edge-to-edge fixes
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    Keyboard.dismiss();

    const newMessages: RNLlamaOAICompatibleMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let streamingContent = "";
      setMessages([...newMessages, { role: "assistant", content: streamingContent }]);

      await generateChatResponse(newMessages, (token) => {
        streamingContent += token;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: streamingContent };
          return updated;
        });
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble thinking of a response. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item, index }: { item: RNLlamaOAICompatibleMessage; index: number }) => {
    if (item.role === "system") return null;

    const isUser = item.role === "user";

    return (
      <View
        className={`px-4 py-3 rounded-2xl mb-3 max-w-[85%] ${isUser ? "bg-green-600 self-end rounded-tr-sm" : "bg-zinc-800 self-start rounded-tl-sm"
          }`}
      >
        <Text className="text-white text-base">{item.content as string}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      className="flex-1 bg-zinc-950"
      style={{ 
        paddingTop: insets.top,
        paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 
      }}
    >
      {/* Header */}
      <View className="px-5 py-4 border-b border-zinc-800 flex-row items-center space-x-3">
        <View className="w-10 h-10 bg-green-900 rounded-full items-center justify-center">
          <Ionicons name="leaf" size={20} color="#4ade80" />
        </View>
        <View>
          <Text className="text-white font-bold text-lg">Planty AI</Text>
          <Text className="text-green-500 text-xs">On-device Model</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <View className="px-4 py-3 border-t border-zinc-800 flex-row items-end space-x-2 bg-zinc-900">
        <TextInput
          className="flex-1 bg-zinc-800 text-white px-4 py-3 rounded-2xl max-h-32 text-base"
          placeholder="Ask about watering, soil, or sunlight..."
          placeholderTextColor="#71717a"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          className={`w-12 h-12 rounded-full items-center justify-center mb-0.5 ${input.trim() && !isLoading ? "bg-green-500" : "bg-zinc-700"
            }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="arrow-up" size={24} color={input.trim() ? "white" : "#a1a1aa"} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
