import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { login as apiLogin } from "../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [headerText, setHeaderText] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiLogin(email.trim(), password);
      DeviceEventEmitter.emit("authStateChanged");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const text = "AYURVISION";
    if (headerText.length < text.length) {
      const timeout = setTimeout(() => {
        setHeaderText(text.slice(0, headerText.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [headerText]);

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
          <Text className="text-5xl mb-3 dark:text-emerald-400 text-emerald-600 font-mono tracking-wider">
            {headerText}
          </Text>
          <Text className="text-3xl font-extrabold dark:text-emerald-50 text-emerald-950">Welcome Back!</Text>
          <Text className="text-base dark:text-emerald-300 text-emerald-700 mt-1">Login to continue</Text>
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
                placeholder="Enter your password"
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

          <TouchableOpacity className="self-end mt-2">
            <Text className="text-sm font-bold dark:text-emerald-400 text-emerald-600">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View className="mt-10 space-y-4">
          <TouchableOpacity
            className={`w-full bg-emerald-500 py-4 rounded-2xl items-center shadow-lg shadow-green-500/30 ${loading ? "opacity-70" : ""}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text className="text-lg font-bold text-emerald-950">Login</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center space-x-1 mt-6">
            <Text className="text-base dark:text-emerald-300 text-emerald-700">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="text-base font-bold dark:text-emerald-400 text-emerald-600">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
