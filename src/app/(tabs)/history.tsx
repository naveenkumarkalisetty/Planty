import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getScanHistory, deleteScan } from "../../services/api";

interface ScanItem {
  _id: string;
  plantName: string;
  confidence: number;
  topPredictions: { label: string; confidence: number }[];
  scannedAt: string;
}

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadScans = useCallback(async () => {
    try {
      const data = await getScanHistory(50, 0);
      setScans(data.scans || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("[History] Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  }, [loadScans]);

  const handleDelete = (scanId: string) => {
    Alert.alert("Delete Scan", "Are you sure you want to remove this scan?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteScan(scanId);
            setScans((prev) => prev.filter((s) => s._id !== scanId));
            setTotal((prev) => prev - 1);
          } catch (err) {
            console.error("[History] Delete failed:", err);
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " • " + d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderScan = ({ item }: { item: ScanItem }) => (
    <View className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 mb-3 border border-black/5 dark:border-white/5">
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 items-center justify-center mr-3">
          <Text className="text-2xl">🌱</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-emerald-950 dark:text-emerald-50">{item.plantName}</Text>
          <Text className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">{formatDate(item.scannedAt)}</Text>
        </View>
        <View className="items-center space-y-1">
          <View className="bg-emerald-500/15 dark:bg-emerald-400/15 py-1 px-2.5 rounded-lg">
            <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {(item.confidence * 100).toFixed(0)}%
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="p-1"
          >
            <Ionicons name="trash-outline" size={18} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-emerald-950">
      <StatusBar barStyle="light-content" backgroundColor="#022c22" />

      {/* Header */}
      <View className="pt-16 px-5 pb-4 flex-row justify-between items-center">
        <Text className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">Scan History</Text>
        <View className="bg-emerald-500/10 dark:bg-emerald-400/10 py-1.5 px-3 rounded-full border border-emerald-500/20 dark:border-emerald-400/20">
          <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{total} scans</Text>
        </View>
      </View>

      <FlatList
        data={scans}
        keyExtractor={(item) => item._id}
        renderItem={renderScan}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center pt-24">
              <Text className="text-6xl mb-4">📋</Text>
              <Text className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-2">No Scan History</Text>
              <Text className="text-base text-emerald-700 dark:text-emerald-300">Your scanned plants will appear here</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
