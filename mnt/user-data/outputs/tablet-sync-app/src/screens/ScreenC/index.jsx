// ============================================
// 平板 3 — 顯示前兩張，選第三張，最後展示組圖
// ============================================

import { useState, useEffect } from "react";
import { ALL_IMAGES } from "../../data/images";
import { listenSelectionA, listenSelectionB, setSelectionC } from "../../firebase/realtimeDB";
import { logClick } from "../../firebase/firestore";

const SESSION_ID = import.meta.env.VITE_SESSION_ID || "session_01";

export default function ScreenC() {
  const [selectionA, setSelectionA] = useState(null);
  const [selectionB, setSelectionB] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false); // 是否顯示最終組圖
  const [sending, setSending] = useState(false);

  // 監聽平板 A 的選擇
  useEffect(() => {
    const unsub = listenSelectionA((data) => {
      setSelectionA(data);
      if (!data) { setSelected(null); setShowResult(false); }
    });
    return () => unsub();
  }, []);

  // 監聽平板 B 的選擇
  useEffect(() => {
    const unsub = listenSelectionB((data) => {
      setSelectionB(data);
      if (!data) { setSelected(null); setShowResult(false); }
    });
    return () => unsub();
  }, []);

  function handleSelect(image) {
    if (showResult) return;
    setSelected(image);
  }

  async function handleFinish() {
    if (!selected || sending || showResult) return;
    setSending(true);
    try {
      await setSelectionC(selected);
      await logClick({ screen: "C", image: selected, sessionId: SESSION_ID });
      setShowResult(true); // 顯示最終結果
    } catch (err) {
      console.error("送出失敗：", err);
      alert("網路連線有問題，請再試一次");
    } finally {
      setSending(false);
    }
  }

  // 剩餘可選的圖（扣掉 A 和 B 已選的）
  const remaining = ALL_IMAGES.filter(
    (img) => img.id !== selectionA?.id && img.id !== selectionB?.id
  );

  // ---- 最終組圖結果畫面 ----
  if (showResult) {
    return (
      <div style={styles.resultWrapper}>
        <div style={styles.resultTopBar}>
          <span style={styles.title}>你的組圖</span>
          <div style={styles.steps}>
            <span style={{ ...styles.step, ...styles.stepDone }}>① 完成</span>
            <span style={{ ...styles.step, ...styles.stepDone }}>② 完成</span>
            <span style={{ ...styles.step, ...styles.stepDone }}>③ 完成</span>
          </div>
          <span style={styles.doneText}>組圖完成 ✓</span>
        </div>

        {/* 三張漸大排列：左小→中→右大 */}
        <div style={styles.resultBody}>
          {[
            { sel: selectionA, order: 1, width: "26%", height: "62%" },
            { sel: selectionB, order: 2, width: "32%", height: "78%" },
            { sel: selected,   order: 3, width: "40%", height: "96%" },
          ].map(({ sel, order, width, height }) => (
            <div key={order} style={{ ...styles.resultCell, width, height }}>
              {sel && (
                <>
                  <img src={sel.src} alt={sel.label} style={styles.resultImg} />
                  <div style={styles.orderBadge}>{order}</div>
                  <div style={styles.resultCaption}>{sel.label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        <div style={styles.resultFooter}>
          <span style={styles.tagline}>這是你說的故事</span>
        </div>
      </div>
    );
  }

  // ---- 選擇畫面 ----
  return (
    <div style={styles.wrapper}>
      {/* 頂部狀態列 */}
      <div style={styles.topBar}>
        <span style={styles.title}>組圖旅程</span>
        <div style={styles.steps}>
          <span style={{ ...styles.step, ...styles.stepDone }}>① 完成</span>
          <span style={{ ...styles.step, ...styles.stepDone }}>② 完成</span>
          <span style={{ ...styles.step, ...styles.stepActive }}>③ 選第三張</span>
        </div>
        <div style={styles.statusDot}>
          <span style={styles.dot} />
          <span style={styles.statusText}>
            {!selectionB ? "等待平板 2..." : selected ? `已選：${selected.label}` : "收到平板 2"}
          </span>
        </div>
      </div>

      <div style={styles.body}>
        {/* 上排：前兩張已選的圖 */}
        <div style={styles.pickedRow}>
          <div style={styles.pickedLabel}>你的前兩張</div>
          <div style={styles.pickedCards}>
            {[{ sel: selectionA, order: 1 }, { sel: selectionB, order: 2 }].map(({ sel, order }) => (
              <div key={order} style={styles.pickedCard}>
                {sel ? (
                  <>
                    <img src={sel.src} alt={sel.label} style={styles.pickedImg} />
                    <div style={styles.pickedOrderBadge}>{order}</div>
                    <div style={styles.pickedCaption}>{sel.label}</div>
                  </>
                ) : (
                  <div style={styles.waiting}>等待中...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 分隔 */}
        <div style={styles.rowDivider} />

        {/* 下排：剩餘 19 張可選 */}
        <div style={styles.choiceArea}>
          <div style={styles.choiceLabel}>從剩餘 {remaining.length} 張選最後一張</div>
          <div style={styles.grid}>
            {remaining.map((image) => {
              const isSelected = selected?.id === image.id;
              return (
                <div
                  key={image.id}
                  onClick={() => handleSelect(image)}
                  style={{
                    ...styles.card,
                    borderColor: isSelected ? "#1D9E75" : "transparent",
                    cursor: !selectionB ? "default" : "pointer",
                    transform: isSelected ? "scale(1.03)" : "scale(1)",
                    pointerEvents: !selectionB ? "none" : "auto",
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
          {!selectionB ? "等待平板 2 選擇..." : "選最後一張，完成你的組圖"}
        </span>
        <button
          onClick={handleFinish}
          disabled={!selected || !selectionB || sending}
          style={{
            ...styles.sendBtn,
            opacity: selected && selectionB && !sending ? 1 : 0.35,
            cursor: selected && selectionB && !sending ? "pointer" : "default",
          }}
        >
          {sending ? "完成中..." : "完成，看我的組圖 →"}
        </button>
      </div>
    </div>
  );
}

const base = {
  wrapper: {
    width: "100vw", height: "100vh", background: "#0c0c11",
    display: "flex", flexDirection: "column", overflow: "hidden",
    fontFamily: "'Noto Sans TC', sans-serif", userSelect: "none",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 18px 8px", borderBottom: "0.5px solid rgba(255,255,255,0.08)", flexShrink: 0,
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
  checkBadge: {
    position: "absolute", top: 4, right: 4, width: 16, height: 16,
    background: "#1D9E75", borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700,
  },
  card: {
    borderRadius: 6, overflow: "hidden", border: "1.5px solid transparent",
    transition: "border-color 0.13s, transform 0.11s", background: "#1a1a22",
    position: "relative", display: "flex", flexDirection: "column",
  },
  cardImg: { width: "100%", flex: 1, objectFit: "contain", background: "#fff", display: "block" },
  cardCaption: {
    padding: "2px 4px", background: "rgba(0,0,0,0.6)", fontSize: 8,
    color: "rgba(255,255,255,0.65)", textAlign: "center", flexShrink: 0,
  },
  bottomBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "6px 18px", borderTop: "0.5px solid rgba(255,255,255,0.08)", flexShrink: 0,
  },
  bottomHint: { fontSize: 10, color: "rgba(255,255,255,0.22)" },
  sendBtn: {
    fontSize: 12, padding: "6px 20px", borderRadius: 6,
    border: "none", background: "#1D9E75", color: "#fff",
    fontWeight: 500, transition: "opacity 0.2s",
  },
  waiting: { fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: 12 },
};

const styles = {
  ...base,
  body: { flex: 1, display: "flex", flexDirection: "column", padding: "8px 14px", gap: 6, overflow: "hidden", minHeight: 0 },
  pickedRow: { display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 },
  pickedLabel: { fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.07em", textTransform: "uppercase" },
  pickedCards: { display: "flex", gap: 8, height: 90 },
  pickedCard: {
    width: 120, height: "100%", borderRadius: 8, overflow: "hidden",
    border: "0.5px solid rgba(29,158,117,0.4)", background: "#1a1a22",
    position: "relative", display: "flex", flexDirection: "column",
  },
  pickedImg: { width: "100%", flex: 1, objectFit: "contain", background: "#fff", display: "block" },
  pickedOrderBadge: {
    position: "absolute", top: 4, left: 4, width: 16, height: 16,
    background: "rgba(29,158,117,0.9)", borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700,
  },
  pickedCaption: {
    padding: "3px 6px", background: "rgba(0,0,0,0.7)", fontSize: 9,
    color: "rgba(255,255,255,0.75)", textAlign: "center",
  },
  rowDivider: { height: 1, background: "rgba(255,255,255,0.06)", flexShrink: 0 },
  choiceArea: { flex: 1, display: "flex", flexDirection: "column", gap: 4, overflow: "hidden", minHeight: 0 },
  choiceLabel: { fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.07em", textTransform: "uppercase" },
  grid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, overflow: "hidden" },

  // 結果畫面
  resultWrapper: {
    width: "100vw", height: "100vh", background: "#0c0c11",
    display: "flex", flexDirection: "column", overflow: "hidden",
    fontFamily: "'Noto Sans TC', sans-serif", userSelect: "none",
  },
  resultTopBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 18px 8px", borderBottom: "0.5px solid rgba(255,255,255,0.08)", flexShrink: 0,
  },
  doneText: { fontSize: 11, color: "rgba(29,158,117,0.9)" },
  resultBody: {
    flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center",
    gap: 12, padding: "16px 20px 0",
  },
  resultCell: {
    borderRadius: 10, overflow: "hidden", position: "relative",
    background: "#1a1a22", flexShrink: 0,
  },
  resultImg: { width: "100%", height: "calc(100% - 26px)", objectFit: "contain", background: "#fff", display: "block" },
  orderBadge: {
    position: "absolute", top: 7, left: 7, width: 20, height: 20,
    background: "rgba(29,158,117,0.95)", borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700,
  },
  resultCaption: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    background: "rgba(0,0,0,0.7)", fontSize: 10,
    color: "rgba(255,255,255,0.85)", padding: "4px 8px", textAlign: "center",
  },
  resultFooter: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "10px 18px 14px",
  },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" },
};
