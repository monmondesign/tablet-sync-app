import { useState, useEffect } from "react";
import { ALL_IMAGES } from "../../data/images";
import { listenSelectionA, listenSelectionB, setSelectionC, resetSession, triggerReset } from "../../firebase/realtimeDB";
import { getDatabase, ref, push } from "firebase/database";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generatePositions() {
  const cols = 6, rows = 4;
  const cellW = 100 / cols, cellH = 100 / rows;
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (Math.random() - 0.5) * cellW * 0.15;
      const offsetY = (Math.random() - 0.5) * cellH * 0.15;
      const rotate = (Math.random() - 0.5) * 6;
      positions.push({ l: c*cellW+offsetX+cellW*0.05, t: r*cellH+offsetY+cellH*0.05, w: cellW*0.86, h: cellH*0.86, rotate });
    }
  }
  return positions;
}

const SCALE_LABELS = ["非常不同意", "不同意", "尚可", "同意", "非常同意"];
const SCALE_QUESTIONS = [
  "在選圖過程中，我覺得這些圖沒有「標準答案」，我可以自由決定故事的走向。",
  "我相信如果讓我的朋友來玩，他們拼湊出來的故事一定跟我的完全不一樣。",
  "雖然沒有文字和固定順序，但我能在腦中將這三張圖串連成一個有邏輯的故事。",
  "我所選擇的圖，觸發我聯想起過去真實的生活經驗或記憶。",
];
const MOOD_OPTIONS = ["溫暖", "孤獨", "奇幻", "日常", "緊張", "其他"];
const AGE_OPTIONS = ["18歲以下", "19-24歲", "25-30歲", "31-40歲", "41歲以上"];

// 三張圖並排元件（說故事頁＆其他問題頁共用）
function ThreeImages({ selectionA, selectionB, selected }) {
  return (
    <div style={{ display:"flex", gap:20, justifyContent:"center", alignItems:"center", marginBottom:24 }}>
      {[{sel:selectionA,order:1},{sel:selectionB,order:2},{sel:selected,order:3}].map(({sel,order}) => (
        <div key={order} style={{ width:"24vw", maxWidth:260, aspectRatio:"1", position:"relative", background:"#fff", borderRadius:4, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", flexShrink:0 }}>
          {sel && <>
            <img src={sel.src} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />
            <div style={{ position:"absolute", top:6, left:6, width:20, height:20, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#f0ede8", fontWeight:700 }}>{order}</div>
          </>}
        </div>
      ))}
    </div>
  );
}

export default function ScreenC() {
  const [selectionA, setSelectionA] = useState(null);
  const [selectionB, setSelectionB] = useState(null);
  const [positions, setPositions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showStory, setShowStory] = useState(false);   // 說故事頁
  const [showSurvey, setShowSurvey] = useState(false); // 其他問題頁
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [story, setStory] = useState("");
  const [reason, setReason] = useState("");
  const [mood, setMood] = useState("");
  const [moodOther, setMoodOther] = useState("");
  const [age, setAge] = useState("");
  const [surveySending, setSurveySending] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPositions(generatePositions());
    const unsubA = listenSelectionA((data) => setSelectionA(data));
    const unsubB = listenSelectionB((data) => setSelectionB(data));
    return () => { unsubA(); unsubB(); };
  }, []);

  async function handleFinish() {
    if (!selected || sending || showResult) return;
    setSending(true);
    try {
      await setSelectionC(selected);
      setShowResult(true);
    } catch (err) {
      alert("錯誤：" + err.message);
    } finally { setSending(false); }
  }

  function validateSurvey() {
    const e = {};
    scores.forEach((s, i) => { if (s === 0) e[`q${i}`] = true; });
    if (!reason) e.reason = true;
    if (!mood) e.mood = true;
    if (mood === "其他" && !moodOther) e.moodOther = true;
    if (!age) e.age = true;
    return e;
  }

  async function handleSurveySubmit() {
    const e = validateSurvey();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      alert("有些題目還沒填喔！請檢查紅框處。");
      return;
    }
    setErrors({});
    setSurveySending(true);
    try {
      const db = getDatabase();
      await push(ref(db, "surveys"), {
        timestamp: Date.now(),
        mode: "tablet",
        imageA: selectionA?.id || null,
        imageB: selectionB?.id || null,
        imageC: selected?.id || null,
        q1: scores[0], q2: scores[1], q3: scores[2], q4: scores[3],
        story, reason,
        mood: mood === "其他" ? `其他：${moodOther}` : mood,
        age,
      });
      setSubmitted(true);
      setTimeout(async () => {
        await resetSession();
        await triggerReset();
        window.location.reload();
      }, 30000);
    } catch (err) {
      alert("儲存失敗：" + err.message);
    } finally { setSurveySending(false); }
  }

  const remaining = shuffle(ALL_IMAGES.filter(img => img.id !== selectionA?.id && img.id !== selectionB?.id));

  const topBar = (label) => (
    <div style={styles.topBar}>
      <span style={styles.title}>屬於你的想像旅程</span>
      <div style={styles.steps}>
        {["① 開始","② 過程","③ 結束"].map(s => (
          <span key={s} style={{...styles.step, ...styles.stepDone}}>{s}</span>
        ))}
      </div>
      <span style={{ fontSize:11, color:"rgba(0,0,0,0.4)", letterSpacing:"0.08em" }}>{label}</span>
    </div>
  );

  // ── 感謝頁 ──
  if (submitted) {
    return (
      <div style={styles.resultWrapper}>
        {topBar("感謝參與")}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
          <div style={{ fontSize:22, letterSpacing:"0.2em", color:"#1a1a1a" }}>感謝你的參與</div>
          <div style={{ fontSize:12, color:"rgba(0,0,0,0.4)", letterSpacing:"0.1em" }}>你的故事已被記錄</div>
          <div style={{ marginTop:8, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://superlative-bienenstitch-9a5f9f.netlify.app/stories" alt="QR Code" style={{ width:160, height:160 }} />
            <div style={{ fontSize:10, color:"rgba(0,0,0,0.35)", letterSpacing:"0.1em" }}>掃描查看創作者的故事版本</div>
          </div>
        </div>
      </div>
    );
  }

  // ── 其他問題頁 ──
  if (showSurvey) {
    return (
      <div style={styles.resultWrapper}>
        {topBar("問卷")}
        <div style={styles.surveyBody}>
          <div style={{ display:"flex", gap:24 }}>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:20 }}>
              <div style={styles.surveySection}>
                <div style={styles.surveySectionTitle}>請依真實感受點選 1～5</div>
                {SCALE_QUESTIONS.map((q, qi) => (
                  <div key={qi} style={{
                    ...styles.scaleRow,
                    border: errors[`q${qi}`] ? "1px solid #c00" : "none",
                    borderBottom: errors[`q${qi}`] ? "1px solid #c00" : "1px solid rgba(0,0,0,0.06)",
                    borderRadius: errors[`q${qi}`] ? 4 : 0,
                    padding: errors[`q${qi}`] ? "8px" : "10px 0",
                    background: errors[`q${qi}`] ? "rgba(200,0,0,0.03)" : "transparent",
                  }}>
                    <div style={styles.scaleQ}>{qi + 1}. {q}</div>
                    <div style={styles.scaleButtons}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => {
                          const s = [...scores]; s[qi] = n; setScores(s);
                          setErrors(prev => ({...prev, [`q${qi}`]: false}));
                        }} style={{
                          ...styles.scaleBtn,
                          background: scores[qi] === n ? "#1a1a1a" : "transparent",
                          color: scores[qi] === n ? "#f0ede8" : "rgba(0,0,0,0.4)",
                          borderColor: scores[qi] === n ? "#1a1a1a" : "rgba(0,0,0,0.2)",
                        }}>{n}</button>
                      ))}
                      <span style={styles.scaleHint}>{scores[qi] ? SCALE_LABELS[scores[qi]-1] : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.surveySection}>
                <div style={styles.surveyLabel}>吸引你選擇某張圖的關鍵原因？</div>
                <textarea value={reason} onChange={e => { setReason(e.target.value); setErrors(prev=>({...prev,reason:false})); }}
                  placeholder="例如：圖一的煙霧感讓我想到⋯請自由發揮，無標準答案"
                  style={{...styles.textarea, borderColor: errors.reason ? "#c00" : "rgba(0,0,0,0.15)"}} />
              </div>
              <div style={styles.surveySection}>
                <div style={styles.surveyLabel}>因你選擇而形成的故事，氛圍你覺得偏向？</div>
                <div style={{ ...styles.moodRow, outline: errors.mood ? "1px solid #c00" : "none", borderRadius:4, padding: errors.mood ? 6 : 0 }}>
                  {MOOD_OPTIONS.map(m => (
                    <button key={m} onClick={() => { setMood(m); setErrors(prev=>({...prev,mood:false})); }} style={{
                      ...styles.moodBtn,
                      background: mood === m ? "#1a1a1a" : "transparent",
                      color: mood === m ? "#f0ede8" : "rgba(0,0,0,0.5)",
                      borderColor: mood === m ? "#1a1a1a" : "rgba(0,0,0,0.2)",
                    }}>{m}</button>
                  ))}
                </div>
                {mood === "其他" && (
                  <textarea value={moodOther} onChange={e => { setMoodOther(e.target.value); setErrors(prev=>({...prev,moodOther:false})); }}
                    placeholder="請說明你的氛圍感受..."
                    style={{...styles.textarea, marginTop:8, borderColor: errors.moodOther ? "#c00" : "rgba(0,0,0,0.15)"}} />
                )}
              </div>
              <div style={styles.surveySection}>
                <div style={styles.surveyLabel}>您的年齡層？</div>
                <div style={{ ...styles.moodRow, outline: errors.age ? "1px solid #c00" : "none", borderRadius:4, padding: errors.age ? 6 : 0 }}>
                  {AGE_OPTIONS.map(a => (
                    <button key={a} onClick={() => { setAge(a); setErrors(prev=>({...prev,age:false})); }} style={{
                      ...styles.moodBtn,
                      background: age === a ? "#1a1a1a" : "transparent",
                      color: age === a ? "#f0ede8" : "rgba(0,0,0,0.5)",
                      borderColor: age === a ? "#1a1a1a" : "rgba(0,0,0,0.2)",
                    }}>{a}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleSurveySubmit} disabled={surveySending} style={styles.submitBtn}>
                {surveySending ? "儲存中..." : "送出問卷"}
              </button>
            </div>
            {/* 右側三張圖 */}
            <div style={{ width:160, display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
              {[{sel:selectionA,order:1},{sel:selectionB,order:2},{sel:selected,order:3}].map(({sel,order}) => (
                <div key={order} style={{ aspectRatio:"1", position:"relative", background:"#fff", borderRadius:4, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
                  {sel && <>
                    <img src={sel.src} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />
                    <div style={{ position:"absolute", top:4, left:4, width:16, height:16, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#f0ede8", fontWeight:700 }}>{order}</div>
                  </>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 說故事頁 ──
  if (showStory) {
    return (
      <div style={styles.resultWrapper}>
        {topBar("說說你的故事")}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 48px" }}>
          <ThreeImages selectionA={selectionA} selectionB={selectionB} selected={selected} />
          <div style={{ width:"100%", maxWidth:700 }}>
            <div style={{ fontSize:13, color:"#1a1a1a", letterSpacing:"0.08em", marginBottom:12, textAlign:"center" }}>
              請為你所選擇的三張圖所形成的故事做敘事說明。
            </div>
            <textarea
              value={story}
              onChange={e => setStory(e.target.value)}
              placeholder="例如：一個關於消逝與重生的故事⋯請自由發揮，無標準答案"
              style={{ ...styles.textarea, width:"100%", minHeight:100, fontSize:13 }}
            />
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
              <button
                onClick={() => { if (story.trim()) setShowSurvey(true); else alert("請先填寫故事說明！"); }}
                style={styles.submitBtn}
              >
                下一頁 →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 結果頁 ──
  if (showResult) {
    return (
      <div style={styles.resultWrapper}>
        {topBar("旅程完成")}
        <div style={styles.resultBody}>
          {[{sel:selectionA,order:1},{sel:selectionB,order:2},{sel:selected,order:3}].map(({sel,order}) => (
            <div key={order} style={styles.resultCell}>
              {sel && <>
                <img src={sel.src} alt="" style={styles.resultImg} />
                <div style={styles.orderBadge}>{order}</div>
              </>}
            </div>
          ))}
        </div>
        <div style={styles.resultFooter}>
          <span style={styles.tagline}>你所形成的故事</span>
          <button onClick={() => setShowStory(true)} style={styles.surveyBtn}>填寫問卷 →</button>
        </div>
      </div>
    );
  }

  // ── 選圖頁 ──
  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <span style={styles.title}>屬於你的想像旅程</span>
        <div style={styles.steps}>
          <span style={{...styles.step, ...styles.stepDone}}>① 開始</span>
          <span style={{...styles.step, ...styles.stepDone}}>② 過程</span>
          <span style={{...styles.step, ...styles.stepActive}}>③ 結束</span>
        </div>
        <div style={styles.statusArea}>
          <span style={styles.statusText}>{!selectionB ? "等待平板 2..." : selected ? "已選" : "收到平板 2"}</span>
        </div>
      </div>
      <div style={styles.body}>
        <div style={styles.leftPanel}>
          <div style={styles.leftLabel}>前兩個片段</div>
          <div style={styles.previewCards}>
            {[{sel:selectionA,order:1},{sel:selectionB,order:2}].map(({sel,order}) => (
              <div key={order} style={styles.previewCard}>
                {sel ? <>
                  <img src={sel.src} alt="" style={styles.previewImg} />
                  <div style={styles.previewOrderBadge}>{order}</div>
                </> : <div style={styles.waiting}>等待中...</div>}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.divider} />
        <div style={styles.rightPanel}>
          <div style={styles.rightLabel}>哪個畫面，為你的故事畫下句點？</div>
          <div style={styles.scatter}>
            {remaining.map((image, index) => {
              const pos = positions[index];
              if (!pos) return null;
              const isSelected = selected?.id === image.id;
              return (
                <div key={image.id}
                  onClick={() => { if (selectionB) setSelected(image); }}
                  style={{
                    position:"absolute", left:`${pos.l}%`, top:`${pos.t}%`,
                    width:`${pos.w}%`, aspectRatio:"1", height:"auto",
                    borderRadius:4, overflow:"hidden",
                    border:`2px solid ${isSelected ? "#1a1a1a" : "transparent"}`,
                    background:"#f5f2ee",
                    transform:`rotate(${isSelected ? 0 : pos.rotate}deg) scale(${isSelected ? 1.15 : 1})`,
                    transition:"border-color 0.2s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
                    cursor: !selectionB ? "default" : "pointer",
                    zIndex: isSelected ? 10 : 1,
                    pointerEvents: !selectionB ? "none" : "auto",
                    boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.08)",
                  }}>
                  <img src={image.src} alt="" style={{ width:"100%", flex:1, objectFit:"cover", background:"#fff", display:"block" }} draggable={false} />
                  {isSelected && <div style={styles.checkBadge}>✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={styles.bottomBar}>
        <span style={styles.bottomHint}>{!selectionB ? "等待平板 2 選擇..." : "選最後一張，完成你的故事"}</span>
        <button onClick={handleFinish} disabled={!selected || !selectionB || sending}
          style={{...styles.sendBtn, opacity: selected && selectionB && !sending ? 1 : 0.3}}>
          {sending ? "完成中..." : "看看接下來會發生什麼 →"}
        </button>
      </div>
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
  previewCards:{ flex:1, display:"flex", flexDirection:"column", gap:8 },
  previewCard:{ height:"47%", borderRadius:4, border:"1px solid rgba(0,0,0,0.1)", overflow:"hidden", background:"#fff", display:"flex", flexDirection:"column", position:"relative" },
  previewImg:{ width:"100%", flex:1, objectFit:"contain", background:"#f0ede8", display:"block" },
  previewOrderBadge:{ position:"absolute", top:4, left:4, width:16, height:16, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#f0ede8", fontWeight:700 },
  waiting:{ fontSize:11, color:"rgba(0,0,0,0.25)", textAlign:"center", padding:16, margin:"auto", letterSpacing:"0.05em" },
  divider:{ width:1, background:"rgba(0,0,0,0.08)", flexShrink:0 },
  rightPanel:{ flex:1, display:"flex", flexDirection:"column", gap:6, overflow:"hidden", minWidth:0 },
  rightLabel:{ fontSize:10, color:"rgba(0,0,0,0.35)", letterSpacing:"0.08em" },
  scatter:{ flex:1, position:"relative", overflow:"hidden" },
  checkBadge:{ position:"absolute", top:4, right:4, width:16, height:16, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#f0ede8", fontWeight:700 },
  bottomBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 24px", borderTop:"1px solid rgba(0,0,0,0.08)", flexShrink:0 },
  bottomHint:{ fontSize:10, color:"rgba(0,0,0,0.3)", letterSpacing:"0.05em" },
  sendBtn:{ fontSize:11, padding:"8px 24px", borderRadius:0, border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#f0ede8", fontWeight:400, cursor:"pointer", letterSpacing:"0.1em" },
  resultWrapper:{ width:"100vw", height:"100dvh", background:"#f0ede8", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'Shippori Mincho', 'Hiragino Mincho Pro', serif", userSelect:"none" },
  resultBody:{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:24, padding:"20px" },
  resultCell:{ width:"28%", aspectRatio:"1", borderRadius:4, overflow:"hidden", position:"relative", background:"#fff", flexShrink:0, boxShadow:"0 2px 12px rgba(0,0,0,0.08)" },
  resultImg:{ width:"100%", height:"100%", objectFit:"contain", background:"#fff", display:"block" },
  orderBadge:{ position:"absolute", top:7, left:7, width:20, height:20, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#f0ede8", fontWeight:700 },
  resultFooter:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 24px 20px" },
  tagline:{ fontSize:14, color:"rgba(0,0,0,0.35)", letterSpacing:"0.2em" },
  surveyBtn:{ fontSize:11, padding:"8px 24px", borderRadius:0, border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#f0ede8", cursor:"pointer", letterSpacing:"0.1em" },
  surveyBody:{ flex:1, overflowY:"auto", padding:"16px 32px 32px", display:"flex", flexDirection:"column", gap:20 },
  surveySection:{ display:"flex", flexDirection:"column", gap:8 },
  surveySectionTitle:{ fontSize:10, color:"rgba(0,0,0,0.4)", letterSpacing:"0.08em", marginBottom:4 },
  surveyLabel:{ fontSize:12, color:"#1a1a1a", letterSpacing:"0.05em", lineHeight:1.6 },
  scaleRow:{ display:"flex", flexDirection:"column", gap:6, padding:"10px 0" },
  scaleQ:{ fontSize:11, color:"#1a1a1a", letterSpacing:"0.04em", lineHeight:1.6 },
  scaleButtons:{ display:"flex", alignItems:"center", gap:8 },
  scaleBtn:{ width:36, height:36, borderRadius:0, border:"1px solid", fontSize:12, cursor:"pointer", flexShrink:0 },
  scaleHint:{ fontSize:10, color:"rgba(0,0,0,0.4)", letterSpacing:"0.05em", marginLeft:4 },
  textarea:{ width:"100%", minHeight:64, padding:"8px 12px", border:"1px solid rgba(0,0,0,0.15)", borderRadius:0, background:"#fff", fontSize:12, fontFamily:"'Shippori Mincho', serif", letterSpacing:"0.05em", resize:"vertical", boxSizing:"border-box" },
  moodRow:{ display:"flex", flexWrap:"wrap", gap:8 },
  moodBtn:{ fontSize:11, padding:"6px 16px", borderRadius:0, border:"1px solid", cursor:"pointer", letterSpacing:"0.05em" },
  submitBtn:{ fontSize:12, padding:"12px 32px", borderRadius:0, border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#f0ede8", cursor:"pointer", letterSpacing:"0.1em", alignSelf:"flex-end", marginTop:8 },
};
