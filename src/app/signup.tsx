import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { register as apiRegister } from "../services/api";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiRegister(fullName.trim(), email.trim(), password);
      DeviceEventEmitter.emit("authStateChanged");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-emerald-950"
      contentContainerClassName="flex-grow justify-center"
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View className="px-8 py-10 w-full max-w-md self-center">
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-5xl mb-3">🌱</Text>
          <Text className="text-3xl font-extrabold dark:text-emerald-50 text-emerald-950">Create Account</Text>
          <Text className="text-base dark:text-emerald-300 text-emerald-700 mt-1">Start your plant journey</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-500/10 p-3 rounded-lg mb-6 border border-red-500/20">
            <Text className="text-red-500 text-center text-sm font-medium">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-2 ml-1">Full Name</Text>
            <TextInput
              className="w-full bg-black/5 dark:bg-white/5 dark:text-emerald-50 text-emerald-950 px-5 py-4 rounded-2xl border border-black/10 dark:border-white/10"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#10b98150"
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-2 ml-1">Email</Text>
            <TextInput
              className="w-full bg-black/5 dark:bg-white/5 dark:text-emerald-50 text-emerald-950 px-5 py-4 rounded-2xl border border-black/10 dark:border-white/10"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#10b98150"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-700 mb-2 ml-1">Password</Text>
            <View className="relative justify-center">
              <TextInput
                className="w-full bg-black/5 dark:bg-white/5 dark:text-emerald-50 text-emerald-950 px-5 py-4 pr-12 rounded-2xl border border-black/10 dark:border-white/10"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#10b98150"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#10b981"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="mt-10 space-y-4">
          <TouchableOpacity
            className={`w-full bg-emerald-500 py-4 rounded-2xl items-center shadow-lg shadow-green-500/30 ${loading ? "opacity-70" : ""}`}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text className="text-lg font-bold text-emerald-950">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center space-x-1 mt-6">
            <Text className="text-base dark:text-emerald-300 text-emerald-700">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-base font-bold dark:text-emerald-400 text-emerald-600">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
