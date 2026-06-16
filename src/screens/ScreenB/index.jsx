import { useState, useEffect } from "react";
import { ALL_IMAGES } from "../../data/images";
import { listenSelectionA, setSelectionB } from "../../firebase/realtimeDB";
import { logClick } from "../../firebase/firestore";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generatePositions() {
  const cols = 6;
  const rows = 4;
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (Math.random() - 0.5) * cellW * 0.05;
      const offsetY = (Math.random() - 0.5) * cellH * 0.05;
      const rotate = (Math.random() - 0.5) * 6;
      positions.push({
        l: c * cellW + offsetX + cellW * 0.05,
        t: r * cellH + offsetY + cellH * 0.05,
        w: cellW * 0.86,
        h: cellH * 0.86,
        rotate,
      });
    }
  }
  return positions;
}

const SESSION_ID = "exhibition_01";

export default function ScreenB() {
  const [selectionA, setSelectionAState] = useState(null);
  const [positions, setPositions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setPositions(generatePositions());
    const unsub = listenSelectionA((data) => {
      setSelectionAState(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => window.location.reload(), 35000);
    return () => clearTimeout(timer);
  }, [sent]);

  async function handleSend() {
    if (!selected || sending || sent) return;
    setSending(true);
    try {
      await setSelectionB(selected);
      logClick({ screen: "B", image: selected, sessionId: SESSION_ID });
      setSent(true);
    } catch (err) {
      alert("網路連線有問題，請再試一次");
    } finally { setSending(false); }
  }

  const images = shuffle(ALL_IMAGES.filter(img => img.id !== selectionA?.id));

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <span style={styles.title}>屬於你的想像旅程</span>
        <div style={styles.steps}>
          <span style={{...styles.step, ...styles.stepDone}}>① 開始</span>
          <span style={{...styles.step, ...styles.stepActive}}>② 過程</span>
          <span style={styles.step}>③ 結束</span>
        </div>
        <div style={styles.statusArea}>
          <span style={styles.statusText}>{!selectionA ? "等待平板 1..." : sent ? "已送出" : selected ? "已選" : "收到平板 1"}</span>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.leftPanel}>
          <div style={styles.leftLabel}>開始</div>
          <div style={styles.previewCard}>
            {selectionA ? (
              <img src={selectionA.src} alt="" style={styles.previewImg} />
            ) : (
              <div style={styles.waiting}>等待平板 1 選擇中...</div>
            )}
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.rightPanel}>
          <div style={styles.rightLabel}>哪個畫面，繼續走進你的腦海呢？</div>
          <div style={styles.scatter}>
            {images.map((image, index) => {
              const pos = positions[index];
              if (!pos) return null;
              const isSelected = selected?.id === image.id;
              return (
                <div key={image.id}
                  onClick={() => { if (!sent && selectionA) setSelected(image); }}
                  style={{
                    position: "absolute",
                    left: `${pos.l}%`,
                    top: `${pos.t}%`,
                    width: `${pos.w}%`,
                    aspectRatio: "1",
                    height: "auto",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `2px solid ${isSelected ? "#1a1a1a" : "transparent"}`,
                    background: "#f5f2ee",
                    display: "flex",
                    flexDirection: "column",
                    transform: `rotate(${isSelected ? 0 : pos.rotate}deg) scale(${isSelected ? 1.15 : 1})`,
                    transition: "border-color 0.2s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
                    opacity: sent && !isSelected ? 0.2 : 1,
                    cursor: !selectionA || sent ? "default" : "pointer",
                    zIndex: isSelected ? 10 : 1,
                    pointerEvents: !selectionA || sent ? "none" : "auto",
                    boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.08)",
                  }}>
                  <img src={image.src} alt="" style={{ width:"100%", flex:1, objectFit:"contain", background:"#fff", display:"block" }} draggable={false} />
                  {isSelected && <div style={styles.checkBadge}>✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <span style={styles.bottomHint}>{!selectionA ? "等待平板 1 選擇..." : sent ? "已傳送至平板 3" : "選一張後送出"}</span>
        <button onClick={handleSend} disabled={!selected || !selectionA || sending || sent}
          style={{...styles.sendBtn, opacity: selected && selectionA && !sending && !sent ? 1 : 0.3}}>
          {sent ? "已送出 ✓" : sending ? "同步中..." : "看看接下來會發生什麼 →"}
        </button>
      </div>
      {sent && <div style={styles.toast}>✓ 已傳送至平板 3，請移至下一台</div>}
    </div>
  );
}

const styles = {
  wrapper:{ width:"100vw", height:"100dvh", background:"#f0ede8", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'Shippori Mincho', 'Hiragino Mincho Pro', serif", userSelect:"none" },
  topBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 24px 10px", borderBottom:"1px solid rgba(0,0,0,0.08)", flexShrink:0, background:"#f0ede8" },
  title:{ fontSize:13, fontWeight:600, color:"#1a1a1a", letterSpacing:"0.15em" },
  steps:{ display:"flex", gap:8 },
  step:{ fontSize:10, padding:"3px 12px", borderRadius:0, border:"1px solid rgba(0,0,0,0.2)", color:"rgba(0,0,0,0.35)", letterSpacing:"0.05em" },
  stepActive:{ background:"#1a1a1a", borderColor:"#1a1a1a", color:"#f0ede8", fontWeight:500 },
  stepDone:{ borderColor:"rgba(0,0,0,0.5)", color:"rgba(0,0,0,0.5)", background:"rgba(0,0,0,0.06)" },
  statusArea:{ minWidth:80, textAlign:"right" },
  statusText:{ fontSize:10, color:"rgba(0,0,0,0.4)", letterSpacing:"0.05em" },
  body:{ flex:1, display:"flex", overflow:"hidden", padding:"10px 14px", gap:12, minHeight:0 },
  leftPanel:{ width:"20%", display:"flex", flexDirection:"column", gap:6, flexShrink:0 },
  leftLabel:{ fontSize:10, color:"rgba(0,0,0,0.35)", letterSpacing:"0.08em" },
  previewCard:{ flex:1, borderRadius:4, border:"1px solid rgba(0,0,0,0.1)", overflow:"hidden", background:"#fff", display:"flex", flexDirection:"column" },
  previewImg:{ width:"100%", flex:1, objectFit:"contain", background:"#f0ede8", display:"block" },
  waiting:{ fontSize:11, color:"rgba(0,0,0,0.25)", textAlign:"center", padding:16, margin:"auto", letterSpacing:"0.05em" },
  divider:{ width:1, background:"rgba(0,0,0,0.08)", flexShrink:0 },
  rightPanel:{ flex:1, display:"flex", flexDirection:"column", gap:6, overflow:"hidden", minWidth:0 },
  rightLabel:{ fontSize:10, color:"rgba(0,0,0,0.35)", letterSpacing:"0.08em" },
  scatter:{ flex:1, position:"relative", overflow:"hidden" },
  checkBadge:{ position:"absolute", top:4, right:4, width:16, height:16, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#f0ede8", fontWeight:700 },
  bottomBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 24px", borderTop:"1px solid rgba(0,0,0,0.08)", flexShrink:0 },
  bottomHint:{ fontSize:10, color:"rgba(0,0,0,0.3)", letterSpacing:"0.05em" },
  sendBtn:{ fontSize:11, padding:"8px 24px", borderRadius:0, border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#f0ede8", fontWeight:400, cursor:"pointer", letterSpacing:"0.1em" },
  toast:{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:"#1a1a1a", color:"#f0ede8", fontSize:11, padding:"10px 24px", borderRadius:0, whiteSpace:"nowrap", pointerEvents:"none", letterSpacing:"0.08em" },
};