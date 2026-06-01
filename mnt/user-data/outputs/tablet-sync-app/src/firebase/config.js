// ============================================
// Firebase 設定
// ============================================
// 這個檔案負責連接到你的 Firebase 帳號
// 裡面的金鑰要填你自己的（從 Firebase 網站複製）

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// ⚠️ 把下面每個空字串，換成你 Firebase 專案的設定值
// 設定值在：Firebase 控制台 → 專案設定 → 你的應用程式 → 複製 firebaseConfig
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// db = Realtime Database（三台平板即時同步用）
export const db = getDatabase(app);

// fsdb = Firestore（記錄點擊資料用）
export const fsdb = getFirestore(app);
