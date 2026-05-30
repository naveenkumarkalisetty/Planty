import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  DeviceEventEmitter,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { clearAuth, getCachedUser, getScanHistory } from "../../services/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [scanCount, setScanCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const u = await getCachedUser();
      setUser(u);
    } catch { }
    try {
      const data = await getScanHistory(1, 0);
      setScanCount(data.total || 0);
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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearAuth();
          DeviceEventEmitter.emit("authStateChanged");
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      label: "Personal Information",
      onPress: () => router.push("/personal-info" as any),
    },
    {
      icon: "settings-outline" as const,
      label: "Settings",
      onPress: () => router.push("/settings"),
    },
    {
      icon: "help-circle-outline" as const,
      label: "Help & Support",
      onPress: () => router.push("/help"),
    },
  ];

  return (
    <View className="flex-1 dark:bg-emerald-950 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
      >
        {/* Profile Card */}
        <View className="items-center pt-20 pb-6">
          <View className="mb-4 relative">
            <View className="w-24 h-24 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 items-center justify-center border-4 border-emerald-500 dark:border-emerald-400">
              <Text className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {user?.fullName
                  ? user.fullName
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                  : "?"}
              </Text>
            </View>
          </View>
          <Text className="text-2xl font-extrabold dark:text-emerald-50 text-emerald-950">{user?.fullName || "User"}</Text>
          <Text className="text-base dark:text-emerald-300 text-emerald-700 mt-1">{user?.email || ""}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 bg-black/5 dark:bg-white/5 rounded-2xl py-5 mt-2 border border-black/5 dark:border-white/5">
          <View className="w-[1px] bg-black/10 dark:bg-white/10" />
          <View className="flex-1 items-center">
            <Text className="text-2xl font-extrabold dark:text-emerald-400 text-emerald-600">{scanCount}</Text>
            <Text className="text-sm dark:text-emerald-300 text-emerald-700 mt-1 font-medium">Scan History</Text>
          </View>
        </View>

        {/* Menu */}
        <View className="mt-8 mx-5 space-y-2">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              className="flex-row items-center bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5"
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 items-center justify-center mr-4">
                <Ionicons name={item.icon} size={20} className="color-emerald-600 dark:color-emerald-400" />
              </View>
              <Text className="flex-1 text-base font-bold dark:text-emerald-50 text-emerald-950">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} className="color-black/20 dark:color-white/20" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center justify-center mx-5 mt-10 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-x-2"
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text className="text-base font-bold text-red-500 dark:text-red-400">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
