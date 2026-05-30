import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getCachedUser, updateProfile } from "../services/api";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getCachedUser();
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  };

  const handleUpdate = async () => {
    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(fullName, password ? password : undefined);
      Alert.alert("Success", "Profile updated successfully");
      setPassword("");
      setConfirmPassword("");
      // get back to previous screen
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-emerald-950"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View className="flex-row items-center pt-14 px-5 pb-4 border-b dark:border-white/5 border-black/5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full dark:bg-white/5 bg-black/5 items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} className="dark:color-emerald-400 color-emerald-700" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold dark:text-emerald-50 text-emerald-950">Personal Info</Text>
      </View>

      <View className="p-5 space-y-6">
        {/* Email - Read Only */}
        <View>
          <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-2 ml-1">Email (Unchangeable)</Text>
          <TextInput
            className="w-full bg-black/10 dark:bg-white/10 dark:text-emerald-50/50 text-emerald-950/50 px-5 py-4 rounded-2xl border border-black/5 dark:border-white/5"
            value={email}
            editable={false}
          />
        </View>

        {/* Full Name */}
        <View>
          <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-2 ml-1">Full Name</Text>
          <TextInput
            className="w-full bg-black/5 dark:bg-white/5 dark:text-emerald-50 text-emerald-950 px-5 py-4 rounded-2xl border border-black/10 dark:border-white/10"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="#10b98150"
          />
        </View>

        {/* Change Password */}
        <View className="pt-4 border-t dark:border-white/5 border-black/5">
          <Text className="text-lg font-bold dark:text-emerald-50 text-emerald-950 mb-4">Change Password</Text>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-2 ml-1">New Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="w-full bg-black/5 dark:bg-white/5 dark:text-emerald-50 text-emerald-950 px-5 py-4 pr-12 rounded-2xl border border-black/10 dark:border-white/10"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Leave blank to keep current"
                  placeholderTextColor="#10b98150"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  className="absolute right-4" 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} className="color-emerald-700 dark:color-emerald-400" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-2 ml-1">Confirm New Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="w-full bg-black/5 dark:bg-white/5 dark:text-emerald-50 text-emerald-950 px-5 py-4 pr-12 rounded-2xl border border-black/10 dark:border-white/10"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#10b98150"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  className="absolute right-4" 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} className="color-emerald-700 dark:color-emerald-400" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className={`w-full bg-emerald-500 py-4 rounded-2xl items-center shadow-lg mt-6 ${loading ? 'opacity-70' : ''}`}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#022c22" />
          ) : (
            <Text className="text-lg font-bold text-emerald-950">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
