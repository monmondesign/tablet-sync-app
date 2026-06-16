import { useState, useEffect } from "react";
import { ALL_IMAGES } from "../../data/images";
import { setSelectionA } from "../../firebase/realtimeDB";
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
  const cols = 7;
  const rows = 3;
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
        w: cellW * 0.88,
        h: cellH * 0.88,
        rotate,
      });
    }
  }
  return positions;
}

const SESSION_ID = "exhibition_01";

export default function ScreenA() {
  const [shuffled, setShuffled] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setShuffled(shuffle(ALL_IMAGES));
    setPositions(generatePositions());
  }, []);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => window.location.reload(), 35000);
    return () => clearTimeout(timer);
  }, [sent]);

  function handleSelect(image) {
    if (sent) return;
    setSelected(image);
  }

  async function handleSend() {
    if (!selected || sending || sent) return;
    setSending(true);
    try {
      await setSelectionA(selected);
      logClick({ screen: "A", image: selected, sessionId: SESSION_ID });
      setSent(true);
    } catch (err) {
      alert("網路連線有問題，請再試一次");
    } finally { setSending(false); }
  }

  function handleReset() {
    setShuffled(shuffle(ALL_IMAGES));
    setPositions(generatePositions());
    setSelected(null);
    setSent(false);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <span style={styles.title}>屬於你的想像旅程</span>
        <div style={styles.steps}>
          <span style={{...styles.step, ...styles.stepActive}}>① 開始</span>
          <span style={styles.step}>② 過程</span>
          <span style={styles.step}>③ 結束</span>
        </div>
        <div style={styles.statusArea}>
          <span style={styles.statusText}>{sent ? "已送出" : selected ? "已選" : "等待選擇"}</span>
        </div>
      </div>
      <div style={styles.hint}>哪個畫面，先走進你的腦海呢？</div>
      <div style={styles.scatter}>
        {shuffled.map((image, index) => {
          const pos = positions[index];
          if (!pos) return null;
          const isSelected = selected?.id === image.id;
          return (
            <div key={image.id} onClick={() => handleSelect(image)} style={{
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
              cursor: sent ? "default" : "pointer",
              zIndex: isSelected ? 10 : 1,
              boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <img src={image.src} alt="" style={{
                width: "100%", flex: 1, objectFit: "cover", background: "#fff", display: "block",
              }} draggable={false} />
              {isSelected && <div style={styles.checkBadge}>✓</div>}
            </div>
          );
        })}
      </div>
      <div style={styles.bottomBar}>
        {sent ? (
          <button onClick={handleReset} style={styles.resetBtn}>↺ 下一位</button>
        ) : (
          <button onClick={handleSend} disabled={!selected || sending} style={{
            ...styles.sendBtn, opacity: selected && !sending ? 1 : 0.3,
          }}>{sending ? "同步中..." : "看看接下來會發生什麼 →"}</button>
        )}
      </div>
      {sent && <div style={styles.toast}>✓ 已傳送至平板 2，請移至下一台</div>}
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
  statusArea:{ minWidth:80, textAlign:"right" },
  statusText:{ fontSize:10, color:"rgba(0,0,0,0.4)", letterSpacing:"0.05em" },
  hint:{ fontSize:10, color:"rgba(0,0,0,0.3)", padding:"6px 24px 0", flexShrink:0, letterSpacing:"0.08em" },
  scatter:{ flex:1, position:"relative", overflow:"hidden" },
  checkBadge:{ position:"absolute", top:5, right:5, width:18, height:18, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#f0ede8", fontWeight:700 },
  bottomBar:{ display:"flex", alignItems:"center", justifyContent:"flex-end", padding:"10px 24px", borderTop:"1px solid rgba(0,0,0,0.08)", flexShrink:0 },
  sendBtn:{ fontSize:11, padding:"8px 24px", borderRadius:0, border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#f0ede8", fontWeight:400, cursor:"pointer", letterSpacing:"0.1em" },
  resetBtn:{ fontSize:11, padding:"8px 20px", borderRadius:0, border:"1px solid rgba(0,0,0,0.3)", background:"transparent", color:"rgba(0,0,0,0.5)", cursor:"pointer", letterSpacing:"0.1em" },
  toast:{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:"#1a1a1a", color:"#f0ede8", fontSize:11, padding:"10px 24px", borderRadius:0, whiteSpace:"nowrap", pointerEvents:"none", letterSpacing:"0.08em" },
};