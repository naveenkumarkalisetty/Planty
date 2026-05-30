import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { RNLlamaOAICompatibleMessage } from "llama.rn";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addMessageToChat, createChat, getChat, getChats } from "../../services/api";
import { generateChatResponse } from "../../services/llmService";

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId as string || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const skipReloadRef = useRef(false);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId as string);
    }
  }, [chatId]);

  useEffect(() => {
    if (currentChatId) {
      if (skipReloadRef.current) {
        skipReloadRef.current = false;
      } else {
        loadSingleChat(currentChatId);
      }
    } else {
      setMessages([{ role: "system", content: "You are Planty, a concise AI plant care assistant." }]);
    }
  }, [currentChatId]);

  const loadChatHistory = async () => {
    try {
      const data = await getChats();
      setChats(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSingleChat = async (id: string) => {
    try {
      setLoading(true);
      const chat = await getChat(id);
      const history = chat.messages || [];
      if (history.length === 0 || history[0].role !== "system") {
        history.unshift({ role: "system", content: "You are Planty, a concise AI plant care assistant." });
      }
      setMessages(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentChatId(null);
    setRefreshing(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");

    // Optimistic update
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);

    try {
      let id = currentChatId;
      if (!id) {
        const newChat = await createChat(userMsg);
        id = newChat._id;
        skipReloadRef.current = true;
        setCurrentChatId(id);
        setChats((prev) => [newChat, ...(prev || [])]);
      }

      await addMessageToChat(id!, "user", userMsg);

      let full_ai_response = "";
      setMessages([...newMessages, { role: "assistant", content: full_ai_response }]);

      await generateChatResponse(newMessages as RNLlamaOAICompatibleMessage[], (token) => {
        full_ai_response += token;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: full_ai_response };
          return updated;
        });
      });

      await addMessageToChat(id!, "assistant", full_ai_response);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const renderSidebar = () => (
    <View className="flex-1 dark:bg-emerald-950 bg-white pt-12 px-4 border-r border-black/10 dark:border-white/10">
      <TouchableOpacity
        className="flex-row items-center justify-center bg-emerald-500 py-3 rounded-xl mb-6 shadow-md"
        onPress={() => {
          setCurrentChatId(null);
          setIsDrawerOpen(false);
        }}
      >
        <Ionicons name="add" size={20} color="#022c22" />
        <Text className="font-bold text-emerald-950 ml-2">New Chat</Text>
      </TouchableOpacity>

      <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-3 uppercase tracking-wider">History</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!chats || chats.length === 0 ? (
          <Text className="dark:text-emerald-300 text-emerald-700 italic">No previous chats</Text>
        ) : (
          chats.map((c) => (
            <TouchableOpacity
              key={c._id}
              className={`py-3 px-3 rounded-lg mb-2 ${currentChatId === c._id ? 'dark:bg-white/10 bg-black/10' : ''}`}
              onPress={() => {
                setCurrentChatId(c._id);
                setIsDrawerOpen(false);
              }}
            >
              <Text className="dark:text-emerald-50 text-emerald-950 font-medium" numberOfLines={1}>{c.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Modal visible={isDrawerOpen} transparent animationType="fade" onRequestClose={() => setIsDrawerOpen(false)}>
        <View className="flex-1 flex-row">
          <View style={{ width: 280 }} className="bg-white dark:bg-emerald-950">
            {renderSidebar()}
          </View>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setIsDrawerOpen(false)} activeOpacity={1} />
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <View className="flex-1 dark:bg-emerald-950 bg-white">
          {/* Header */}
          <View className="flex-row items-center pt-14 px-4 pb-3 border-b dark:border-white/10 border-black/5 bg-transparent">
            <TouchableOpacity onPress={() => setIsDrawerOpen(true)} className="p-2">
              <Ionicons name="menu" size={26} className="dark:color-emerald-400 color-emerald-700" />
            </TouchableOpacity>
            <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950 ml-3">AyurChat</Text>
          </View>

          {/* Chat Area */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 pt-4"
            contentContainerClassName="pb-6"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#10b981"
                colors={["#10b981"]}
              />
            }
          >
            {loading ? (
              <ActivityIndicator size="large" className="mt-10" color="#10b981" />
            ) : messages.length <= 1 ? (
              <View className="flex-1 items-center justify-center mt-20 opacity-50">
                <Ionicons name="chatbubbles-outline" size={60} className="dark:color-emerald-400 color-emerald-700 mb-4" />
                <Text className="text-lg dark:text-emerald-300 text-emerald-700 font-medium">New chat</Text>
                <Text className="dark:text-emerald-400 text-emerald-600 mt-1">Send a message to start.</Text>
                <Text className="dark:text-emerald-500/50 text-emerald-700/50 mt-4 text-xs italic">(Pull to start a new chat)</Text>
              </View>
            ) : (
              messages.filter(msg => msg.role !== 'system').map((msg, i) => (
                <View
                  key={i}
                  className={`mb-4 max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-emerald-500 self-end rounded-tr-sm' : 'dark:bg-white/10 bg-black/5 self-start rounded-tl-sm border dark:border-white/5 border-black/5'}`}
                >
                  <Text className={`text-base ${msg.role === 'user' ? 'text-emerald-950 font-medium' : 'dark:text-emerald-50 text-emerald-950 leading-relaxed'}`}>
                    {msg.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Input Area */}
          <View className="p-4 border-t dark:border-white/10 border-black/10 bg-transparent">
            <View className="flex-row items-end bg-black/5 dark:bg-white/10 rounded-3xl p-2 border border-black/10 dark:border-white/10">
              <TextInput
                className="flex-1 min-h-[40px] max-h-32 dark:text-emerald-50 text-emerald-950 px-4 py-2"
                multiline
                placeholder="Ask about Ayurvedic plants..."
                placeholderTextColor="#10b98180"
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity
                className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${input.trim() ? 'bg-emerald-500' : 'bg-emerald-500/50'}`}
                disabled={!input.trim()}
                onPress={handleSend}
              >
                <Ionicons name="arrow-up" size={20} color="#022c22" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
