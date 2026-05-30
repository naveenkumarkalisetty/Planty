import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCachedUser, getScanHistory, getChats, getCachedScans, getCachedChatThreads } from "../../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await getCachedUser();
      if (user?.fullName) {
        setUserName(user.fullName.split(" ")[0]);
      }
    } catch { }

    try {
      const cachedScans = await getCachedScans();
      if (cachedScans) setRecentScans(cachedScans);
      
      const data = await getScanHistory(3, 0);
      setRecentScans(data.scans || []);
    } catch { }

    try {
      const cachedChats = await getCachedChatThreads();
      if (cachedChats) setRecentChats(cachedChats.slice(0, 3));
      
      const chats = await getChats();
      setRecentChats(chats.slice(0, 3) || []);
    } catch { }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <View className="flex-1 dark:bg-emerald-950 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
      >
        {/* Top Bar */}
        <View className="flex-row justify-between items-center pt-14 px-5 pb-2">
          <View className="flex-row items-center space-x-2">
            <Text className="text-2xl">🌿</Text>
            <Text className="text-2xl font-extrabold dark:text-emerald-50 text-emerald-950 tracking-wide">
              AyurVision
            </Text>
          </View>
        </View>

        {/* Greeting */}
        <View className="px-5 pt-5 pb-4">
          <Text className="text-3xl font-bold dark:text-emerald-50 text-emerald-950">Hello, {userName}! 👋</Text>
          <Text className="text-base dark:text-emerald-300 text-emerald-700 mt-1">What would you like to do today?</Text>
        </View>

        {/* Scan Hero Card */}
        <TouchableOpacity
          className="mx-5 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-3xl p-6 flex-row items-center justify-between border border-emerald-500/20 dark:border-emerald-400/20"
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/scan")}
        >
          <View className="flex-1">
            <Text className="text-2xl font-extrabold dark:text-emerald-50 text-emerald-950">Scan a Plant</Text>
            <Text className="text-sm dark:text-emerald-300 text-emerald-700 mt-1 mb-4 pr-4">
              Identify any Ayurvedic plant with AI
            </Text>
            <View className="flex-row bg-emerald-500 dark:bg-emerald-400 py-2.5 px-4 rounded-full items-center self-start space-x-1.5 shadow-sm">
              <Ionicons name="camera" size={18} color="#022c22" />
              <Text className="text-sm font-bold text-emerald-50 dark:text-emerald-950">Open Scanner</Text>
            </View>
          </View>
          <Text className="text-5xl ml-3">📸</Text>
        </TouchableOpacity>

        {/* Recent Conversations */}
        <View className="mt-8 px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950">Recent Conversations</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/chat")}>
              <Text className="text-sm dark:text-emerald-400 text-emerald-600 font-semibold">Chat</Text>
            </TouchableOpacity>
          </View>

          {recentChats.length === 0 ? (
            <TouchableOpacity 
              className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 items-center border border-black/10 dark:border-white/10"
              onPress={() => router.push("/(tabs)/chat")}
            >
              <Text className="text-4xl mb-2">💬</Text>
              <Text className="text-sm dark:text-emerald-300 text-emerald-700 text-center">
                New chat, no messages yet.
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="space-y-3">
              {recentChats.map((chat: any) => (
                <TouchableOpacity 
                  key={chat._id} 
                  className="flex-row items-center bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5"
                  onPress={() => router.push({ pathname: "/(tabs)/chat", params: { chatId: chat._id } })}
                >
                  <View className="w-11 h-11 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
                    <Ionicons name="chatbubbles-outline" size={20} className="dark:color-purple-400 color-purple-600" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold dark:text-emerald-50 text-emerald-950" numberOfLines={1}>{chat.title}</Text>
                    <Text className="text-xs dark:text-emerald-300 text-emerald-700 mt-0.5">
                      {new Date(chat.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} className="dark:color-white/20 color-black/20" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Scans */}
        <View className="mt-8 px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold dark:text-emerald-50 text-emerald-950">Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text className="text-sm dark:text-emerald-400 text-emerald-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          {recentScans.length === 0 ? (
            <View className="bg-black/5 dark:bg-white/5 rounded-2xl p-8 items-center border border-black/10 dark:border-white/10">
              <Text className="text-4xl mb-2">🔍</Text>
              <Text className="text-sm dark:text-emerald-300 text-emerald-700 text-center">
                No scans yet. Start by scanning a plant!
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {recentScans.map((scan: any) => (
                <View key={scan._id} className="flex-row items-center bg-black/5 dark:bg-white/5 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                  <View className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 items-center justify-center mr-3">
                    <Text className="text-2xl">🌱</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold dark:text-emerald-50 text-emerald-950">{scan.plantName}</Text>
                    <Text className="text-xs dark:text-emerald-300 text-emerald-700 mt-0.5">
                      {new Date(scan.scannedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Text className="text-base font-bold dark:text-emerald-400 text-emerald-600">
                    {(scan.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
