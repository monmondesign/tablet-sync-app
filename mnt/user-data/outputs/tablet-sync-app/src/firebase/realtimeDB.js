// ============================================
// Firebase Realtime Database 操作
// ============================================
// 這個檔案處理三台平板之間的即時同步
// 平板 A 寫入 → 平板 B 馬上收到 → 平板 B 寫入 → 平板 C 馬上收到

import { ref, set, onValue, remove } from "firebase/database";
import { db } from "./config";

// ---------- 平板 A 使用 ----------

// 平板 A：寫入開始選擇
export function setSelectionA(image) {
  return set(ref(db, "session/selectionA"), {
    id: image.id,
    file: image.file,
    label: image.label,
    src: image.src,
    updatedAt: Date.now(),
  });
}

// ---------- 平板 B 使用 ----------

// 平板 B：監聽平板 A 的選擇（一有變化就自動觸發 callback）
export function listenSelectionA(callback) {
  return onValue(ref(db, "session/selectionA"), (snapshot) => {
    callback(snapshot.val()); // snapshot.val() 就是資料內容，沒有就是 null
  });
}

// 平板 B：寫入過程選擇
export function setSelectionB(image) {
  return set(ref(db, "session/selectionB"), {
    id: image.id,
    file: image.file,
    label: image.label,
    src: image.src,
    updatedAt: Date.now(),
  });
}

// ---------- 平板 C 使用 ----------

// 平板 C：同時監聽 A 和 B 的選擇
export function listenSelectionB(callback) {
  return onValue(ref(db, "session/selectionB"), (snapshot) => {
    callback(snapshot.val());
  });
}

// 平板 C：寫入結束選擇
export function setSelectionC(image) {
  return set(ref(db, "session/selectionC"), {
    id: image.id,
    file: image.file,
    label: image.label,
    src: image.src,
    updatedAt: Date.now(),
  });
}

// ---------- 管理用 ----------

// 清除全部選擇，重新開始（管理後台按「重置」時用）
export function resetSession() {
  return remove(ref(db, "session"));
}

// 監聽整個 session 狀態（管理後台用）
export function listenSession(callback) {
  return onValue(ref(db, "session"), (snapshot) => {
    callback(snapshot.val());
  });
}
