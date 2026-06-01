import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { fsdb } from "./config";

export async function logClick({ screen, image, sessionId }) {
  try {
    await addDoc(collection(fsdb, "clicks"), {
      screen,
      imageId: image.id,
      imageLabel: image.label,
      imageFile: image.file,
      sessionId: sessionId || "default",
      timestamp: serverTimestamp(),
      deviceWidth: window.innerWidth,
      deviceHeight: window.innerHeight,
    });
  } catch (error) {
    console.warn("點擊紀錄失敗：", error);
  }
}