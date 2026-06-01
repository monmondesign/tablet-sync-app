// ============================================
// 平板 2 — 左側顯示平板1的選擇，右側選第二張
// ============================================

import { useState, useEffect } from "react";
import { ALL_IMAGES } from "../../data/images";
import { listenSelectionA, setSelectionB } from "../../firebase/realtimeDB";
import { logClick } from "../../firebase/firestore";

const SESSION_ID = import.meta.env.VITE_SESSION_ID || "session_01";

export default function ScreenB() {
  const [selectionA, setSelectionA] = useState(null); // 從平板1收到的選擇
  const [selected, setSelected] = useState(null);     // 平板2自己的選擇
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // 監聽平板 A 的選擇，一有變化就自動更新
  useEffect(() => {
    const unsubscribe = listenSelectionA((data) => {
      setSelectionA(data);
      // 平板A重置後，平板B也要跟著重置
      if (!data) {
        setSelected(null);
        setSent(false);
      }
    });
    return () => unsubscribe(); // 離開頁面時取消監聽
  }, []);

  function handleSelect(image) {
    if (sent) return;
    setSelected(image);
  }

  async function handleSend() {
    if (!selected || sending || sent) return;
    setSending(true);
    try {
      await setSelectionB(selected);
      await logClick({ screen: "B", image: selected, sessionId: SESSION_ID });
      setSent(true);
    } catch (err) {
      console.error("送出失敗：", err);
      alert("網路連線有問題，請再試一次");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* 頂部狀態列 */}
      <div style={styles.topBar}>
        <span style={styles.title}>組圖旅程</span>
        <div style={styles.steps}>
          <span style={{ ...styles.step, ...styles.stepDone }}>① 完成</span>
          <span style={{ ...styles.step, ...styles.stepActive }}>② 選第二張</span>
          <span style={styles.step}>③ 選第三張</span>
        </div>
        <div style={styles.statusDot}>
          <span style={styles.dot} />
          <span style={styles.statusText}>
            {!selectionA
              ? "等待平板 1..."
              : sent
              ? "已送出"
              : selected
              ? `已選：${selected.label}`
              : "收到平板 1"}
          </span>
        </div>
      </div>

      {/* 主體區域 */}
      <div style={styles.body}>

        {/* 左側：平板1選的圖（固定展示） */}
        <div style={styles.leftPanel}>
          <div style={styles.leftLabel}>你的第一張</div>
          <div style={styles.previewCard}>
            {selectionA ? (
              <>
                <img src={selectionA.src} alt={selectionA.label} style={styles.previewImg} />
                <div style={styles.previewCaption}>{selectionA.label}</div>
              </>
            ) : (
              <div style={styles.waiting}>等待平板 1 選擇中...</div>
            )}
          </div>
        </div>

        {/* 分隔線 */}
        <div style={styles.divider} />

        {/* 右側：21 張全部可選 */}
        <div style={styles.rightPanel}>
          <div style={styles.rightLabel}>從 21 張中再選一張</div>
          <div style={styles.grid}>
            {ALL_IMAGES.map((image) => {
              const isSelected = selected?.id === image.id;
              return (
                <div
                  key={image.id}
                  onClick={() => handleSelect(image)}
                  style={{
                    ...styles.card,
                    borderColor: isSelected ? "#1D9E75" : "transparent",
                    opacity: sent && !isSelected ? 0.25 : 1,
                    cursor: sent || !selectionA ? "default" : "pointer",
                    transform: isSelected ? "scale(1.03)" : "scale(1)",
                    pointerEvents: !selectionA || sent ? "none" : "auto",
                  }}
                >
                  <img src={image.src} alt={image.label} style={styles.cardImg} draggable={false} />
                  {isSelected && <div style={styles.checkBadge}>✓</div>}
                  <div style={styles.cardCaption}>{image.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部操作列 */}
      <div style={styles.bottomBar}>
        <span style={styles.bottomHint}>
          {!selectionA ? "等待平板 1 選擇..." : sent ? "已傳送至平板 3，請移至下一台" : "選一張後送出"}
        </span>
        <button
          onClick={handleSend}
          disabled={!selected || !selectionA || sending || sent}
          style={{
            ...styles.sendBtn,
            opacity: selected && selectionA && !sending && !sent ? 1 : 0.35,
            cursor: selected && selectionA && !sending && !sent ? "pointer" : "default",
          }}
        >
          {sent ? "已送出 ✓" : sending ? "同步中..." : "同步到平板 3 →"}
        </button>
      </div>

      {sent && (
        <div style={styles.toast}>✓ 已傳送至平板 3，請移至下一台</div>
      )}
    </div>
  );
}

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
  title: { fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" },
  steps: { display: "flex", gap: 6 },
  step: {
    fontSize: 10, padding: "2px 10px", borderRadius: 12,
    border: "0.5px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.28)",
  },
  stepActive: { background: "#1D9E75", borderColor: "#1D9E75", color: "#fff", fontWeight: 500 },
  stepDone: { borderColor: "rgba(29,158,117,0.5)", color: "rgba(29,158,117,0.8)" },
  statusDot: { display: "flex", alignItems: "center", gap: 5 },
  dot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" },
  statusText: { fontSize: 10, color: "rgba(255,255,255,0.35)" },
  body: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    padding: "10px 14px",
    gap: 12,
    minHeight: 0,
  },
  leftPanel: {
    width: "22%",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flexShrink: 0,
  },
  leftLabel: {
    fontSize: 10, color: "rgba(255,255,255,0.28)",
    letterSpacing: "0.07em", textTransform: "uppercase",
  },
  previewCard: {
    flex: 1,
    borderRadius: 10,
    border: "0.5px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
    background: "#1a1a22",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  previewImg: {
    width: "100%", flex: 1, objectFit: "contain",
    background: "#fff", display: "block",
  },
  previewCaption: {
    padding: "4px 8px",
    background: "rgba(0,0,0,0.7)",
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    width: "100%",
  },
  waiting: {
    fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: 16,
  },
  divider: {
    width: 1, background: "rgba(255,255,255,0.06)", flexShrink: 0,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflow: "hidden",
    minWidth: 0,
  },
  rightLabel: {
    fontSize: 10, color: "rgba(255,255,255,0.28)",
    letterSpacing: "0.07em", textTransform: "uppercase",
  },
  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: 6,
    overflow: "hidden",
  },
  card: {
    borderRadius: 6,
    overflow: "hidden",
    border: "1.5px solid transparent",
    transition: "border-color 0.13s, transform 0.11s, opacity 0.2s",
    background: "#1a1a22",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  },
  cardImg: {
    width: "100%", flex: 1, objectFit: "contain",
    background: "#fff", display: "block",
  },
  checkBadge: {
    position: "absolute", top: 4, right: 4,
    width: 16, height: 16,
    background: "#1D9E75", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, color: "#fff", fontWeight: 700,
  },
  cardCaption: {
    padding: "2px 4px",
    background: "rgba(0,0,0,0.6)",
    fontSize: 8,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    flexShrink: 0,
  },
  bottomBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "6px 18px",
    borderTop: "0.5px solid rgba(255,255,255,0.08)",
    flexShrink: 0,
  },
  bottomHint: { fontSize: 10, color: "rgba(255,255,255,0.22)" },
  sendBtn: {
    fontSize: 12, padding: "6px 20px", borderRadius: 6,
    border: "none", background: "#1D9E75", color: "#fff",
    fontWeight: 500, transition: "opacity 0.2s",
  },
  toast: {
    position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
    background: "#1D9E75", color: "#fff", fontSize: 12,
    padding: "8px 20px", borderRadius: 20, whiteSpace: "nowrap", pointerEvents: "none",
  },
};
