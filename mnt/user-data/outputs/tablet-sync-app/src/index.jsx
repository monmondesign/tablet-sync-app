// ============================================
// 平板 1 — 21 張圖打散，觀者選開始
// ============================================

import { useState, useEffect, useRef } from "react";
import { ALL_IMAGES } from "../../data/images";
import { setSelectionA } from "../../firebase/realtimeDB";
import { logClick } from "../../firebase/firestore";

// 21 個固定位置（百分比），大小略有差異，製造自然散落感
const POSITIONS = [
  { l: 1,  t: 3,  w: 18, h: 62 },
  { l: 21, t: 1,  w: 16, h: 54 },
  { l: 39, t: 6,  w: 17, h: 58 },
  { l: 58, t: 2,  w: 18, h: 60 },
  { l: 78, t: 4,  w: 14, h: 52 },
  { l: 2,  t: 55, w: 15, h: 42 },
  { l: 20, t: 60, w: 17, h: 38 },
  { l: 39, t: 68, w: 14, h: 30 },
  { l: 56, t: 64, w: 16, h: 34 },
  { l: 74, t: 58, w: 15, h: 40 },
  { l: 2,  t: 78, w: 13, h: 20 },
  { l: 18, t: 80, w: 12, h: 18 },
  { l: 33, t: 76, w: 14, h: 22 },
  { l: 50, t: 78, w: 13, h: 20 },
  { l: 66, t: 75, w: 14, h: 23 },
  { l: 82, t: 72, w: 13, h: 26 },
  { l: 83, t: 5,  w: 16, h: 55 },
  { l: 83, t: 45, w: 15, h: 25 },
  { l: 5,  t: 33, w: 12, h: 20 },
  { l: 48, t: 33, w: 12, h: 20 },
  { l: 67, t: 35, w: 11, h: 18 },
];

// 陣列隨機排列（每次重置重新 shuffle）
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SESSION_ID = import.meta.env.VITE_SESSION_ID || "session_01";

export default function ScreenA() {
  const [shuffled, setShuffled] = useState([]);
  const [selected, setSelected] = useState(null);   // 目前選中的圖片物件
  const [sent, setSent] = useState(false);           // 是否已送出
  const [sending, setSending] = useState(false);     // 送出中（防止重複點）

  // 初始化：打散圖片順序
  useEffect(() => {
    setShuffled(shuffle(ALL_IMAGES));
  }, []);

  // 點選圖片
  function handleSelect(image) {
    if (sent) return; // 已送出就不能再選
    setSelected(image);
  }

  // 送出到平板 2
  async function handleSend() {
    if (!selected || sending || sent) return;
    setSending(true);
    try {
      await setSelectionA(selected);                            // 寫入 Firebase
      await logClick({ screen: "A", image: selected, sessionId: SESSION_ID }); // 記錄點擊
      setSent(true);
    } catch (err) {
      console.error("送出失敗：", err);
      alert("網路連線有問題，請再試一次");
    } finally {
      setSending(false);
    }
  }

  // 重置（讓下一位觀者使用）
  function handleReset() {
    setShuffled(shuffle(ALL_IMAGES));
    setSelected(null);
    setSent(false);
  }

  return (
    <div style={styles.wrapper}>
      {/* 頂部狀態列 */}
      <div style={styles.topBar}>
        <span style={styles.title}>組圖旅程</span>
        <div style={styles.steps}>
          <span style={{ ...styles.step, ...styles.stepActive }}>① 選開始</span>
          <span style={styles.step}>② 選過程</span>
          <span style={styles.step}>③ 選結束</span>
        </div>
        <div style={styles.statusDot}>
          <span style={styles.dot} />
          <span style={styles.statusText}>
            {sent ? "已送出" : selected ? `已選：${selected.label}` : "等待選擇"}
          </span>
        </div>
      </div>

      {/* 說明文字 */}
      <div style={styles.hint}>從 21 張圖中選一張，開始你的故事</div>

      {/* 打散圖片區 */}
      <div style={styles.scatter}>
        {shuffled.map((image, index) => {
          const pos = POSITIONS[index];
          const isSelected = selected?.id === image.id;
          return (
            <div
              key={image.id}
              onClick={() => handleSelect(image)}
              style={{
                ...styles.card,
                left: `${pos.l}%`,
                top: `${pos.t}%`,
                width: `${pos.w}%`,
                height: `${pos.h}%`,
                borderColor: isSelected ? "#1D9E75" : "transparent",
                opacity: sent && !isSelected ? 0.25 : 1,
                cursor: sent ? "default" : "pointer",
                transform: isSelected ? "scale(1.03)" : "scale(1)",
              }}
            >
              <img
                src={image.src}
                alt={image.label}
                style={styles.img}
                draggable={false}
              />
              {/* 選中的勾勾 */}
              {isSelected && <div style={styles.checkBadge}>✓</div>}
              <div style={styles.caption}>{image.label}</div>
            </div>
          );
        })}
      </div>

      {/* 底部操作列 */}
      <div style={styles.bottomBar}>
        {sent ? (
          // 送出後顯示重置按鈕（讓下一位使用）
          <button onClick={handleReset} style={styles.resetBtn}>
            ↺ 下一位
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!selected || sending}
            style={{
              ...styles.sendBtn,
              opacity: selected && !sending ? 1 : 0.35,
              cursor: selected && !sending ? "pointer" : "default",
            }}
          >
            {sending ? "同步中..." : "同步到平板 2 →"}
          </button>
        )}
      </div>

      {/* 送出成功提示 */}
      {sent && (
        <div style={styles.toast}>✓ 已傳送至平板 2，請移至下一台</div>
      )}
    </div>
  );
}

// ---- 樣式 ----
const styles = {
  wrapper: {
    width: "100vw",
    height: "100vh",
    background: "#0c0c11",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Noto Sans TC', sans-serif",
    userSelect: "none",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px 8px",
    borderBottom: "0.5px solid rgba(255,255,255,0.08)",
    flexShrink: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: "0.04em",
  },
  steps: { display: "flex", gap: 6 },
  step: {
    fontSize: 10,
    padding: "2px 10px",
    borderRadius: 12,
    border: "0.5px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.28)",
  },
  stepActive: {
    background: "#1D9E75",
    borderColor: "#1D9E75",
    color: "#fff",
    fontWeight: 500,
  },
  stepDone: {
    borderColor: "rgba(29,158,117,0.5)",
    color: "rgba(29,158,117,0.8)",
  },
  statusDot: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#1D9E75",
  },
  statusText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
  },
  hint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    padding: "6px 18px 0",
    flexShrink: 0,
  },
  scatter: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  card: {
    position: "absolute",
    borderRadius: 8,
    overflow: "hidden",
    border: "1.5px solid transparent",
    transition: "border-color 0.15s, transform 0.12s, opacity 0.2s",
    background: "#1a1a22",
    display: "flex",
    flexDirection: "column",
  },
  img: {
    width: "100%",
    flex: 1,
    objectFit: "contain",
    background: "#fff",
    display: "block",
  },
  checkBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    background: "#1D9E75",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    color: "#fff",
    fontWeight: 700,
  },
  caption: {
    padding: "3px 6px",
    background: "rgba(0,0,0,0.6)",
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    flexShrink: 0,
  },
  bottomBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "6px 18px",
    borderTop: "0.5px solid rgba(255,255,255,0.08)",
    flexShrink: 0,
  },
  sendBtn: {
    fontSize: 12,
    padding: "6px 20px",
    borderRadius: 6,
    border: "none",
    background: "#1D9E75",
    color: "#fff",
    fontWeight: 500,
    transition: "opacity 0.2s",
  },
  resetBtn: {
    fontSize: 12,
    padding: "6px 16px",
    borderRadius: 6,
    border: "0.5px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1D9E75",
    color: "#fff",
    fontSize: 12,
    padding: "8px 20px",
    borderRadius: 20,
    whiteSpace: "nowrap",
    pointerEvents: "none",
  },
};
