/**
 * api.ts — Centralized API client for the Planty backend.
 *
 * All requests attach the JWT token from AsyncStorage.
 * Base URL points to the local dev server by default.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";


const BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api`;

const TOKEN_KEY = "planty_jwt";
const USER_KEY = "planty_user";

// ─── Token helpers ──────────────────────────────────────────────
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, 'chat_threads', 'scan_history']);
}

export async function getCachedUser(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function setCachedUser(user: any): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function setChatThreads(chats: any): Promise<void> {
  await AsyncStorage.setItem("chat_threads", JSON.stringify(chats));
}

export async function getCachedChatThreads(): Promise<any | null> {
  const raw = await AsyncStorage.getItem("chat_threads");
  return raw ? JSON.parse(raw) : null;
}

export async function setCachedScans(scans: any): Promise<void> {
  await AsyncStorage.setItem("scan_history", JSON.stringify(scans));
}

export async function getCachedScans(): Promise<any | null> {
  const raw = await AsyncStorage.getItem("scan_history");
  return raw ? JSON.parse(raw) : null;
}

// ─── Generic fetch wrapper ──────────────────────────────────────
async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

// ─── Auth API ───────────────────────────────────────────────────
export async function register(
  fullName: string,
  email: string,
  password: string
) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });
  await setToken(data.token);
  await setCachedUser(data.user);
  return data;
}

export async function login(email: string, password: string) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  await setCachedUser(data.user);
  return data;
}

export async function getProfile() {
  const data = await apiFetch("/auth/me");
  await setCachedUser(data.user);
  return data;
}

export async function updateProfile(fullName: string, password?: string) {
  const data = await apiFetch("/auth/me", {
    method: "PUT",
    body: JSON.stringify({ fullName, password }),
  });
  await setCachedUser(data.user);
  return data;
}

// ─── Scan History API ───────────────────────────────────────────
export async function saveScan(
  plantName: string,
  confidence: number,
  topPredictions: { label: string; confidence: number }[]
) {
  return apiFetch("/scans", {
    method: "POST",
    body: JSON.stringify({ plantName, confidence, topPredictions }),
  });
}

export async function getScanHistory(limit = 20, skip = 0) {
  const data = await apiFetch(`/scans?limit=${limit}&skip=${skip}`);
  if (skip === 0 && data.scans) {
    await setCachedScans(data.scans);
  }
  return data;
}

export async function deleteScan(scanId: string) {
  return apiFetch(`/scans/${scanId}`, { method: "DELETE" });
}

// ─── Chat API ───────────────────────────────────────────────────
export async function getChats() {
  const data = await apiFetch("/chats");
  await setChatThreads(data);
  return data;
}

export async function getChat(chatId: string) {
  return apiFetch(`/chats/${chatId}`);
}

export async function createChat(title?: string) {
  return apiFetch("/chats", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function addMessageToChat(chatId: string, role: string, content: string) {
  return apiFetch(`/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ role, content }),
  });
}

export async function deleteChat(chatId: string) {
  return apiFetch(`/chats/${chatId}`, { method: "DELETE" });
}
