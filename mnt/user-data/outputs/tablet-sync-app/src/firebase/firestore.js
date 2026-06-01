// ============================================
// Firestore 點擊紀錄
// ============================================
// 每次觀者點圖，就把資料存到 Firestore
// 之後管理後台可以查「哪張圖最多人選」

import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { fsdb } from "./config";

// 記錄一次點擊
// 用法：logClick({ screen: "A", image: { id, label }, sessionId: "sess_001" })
export async function logClick({ screen, image, sessionId }) {
  try {
    await addDoc(collection(fsdb, "clicks"), {
      screen,                          // 哪台平板（"A" / "B" / "C"）
      imageId: image.id,               // 圖片 ID
      imageLabel: image.label,         // 圖片標題
      imageFile: image.file,           // 檔名
      sessionId: sessionId || "default",
      timestamp: serverTimestamp(),    // Firebase 自動填入時間
      deviceWidth: window.innerWidth,
      deviceHeight: window.innerHeight,
    });
  } catch (error) {
    // 記錄失敗不影響主程式運作，靜默處理
    console.warn("點擊紀錄失敗：", error);
  }
}

// 讀取所有點擊紀錄（管理後台用）
export async function getAllClicks() {
  try {
    const q = query(collection(fsdb, "clicks"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("讀取點擊紀錄失敗：", error);
    return [];
  }
}
