import { useState } from "react";
import { ALL_IMAGES } from "../../data/images";
import { getDatabase, ref, push } from "firebase/database";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

function ThreeImages({ sel1, sel2, sel3 }) {
  return (
    <div style={{ display:"flex", gap:20, justifyContent:"center", alignItems:"center", marginBottom:24 }}>
      {[{sel:sel1,order:1},{sel:sel2,order:2},{sel:sel3,order:3}].map(({sel,order}) => (
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

export default function Solo() {
  const [step, setStep] = useState(1); // 1,2,3=選圖 4=說故事 5=其他問題
  const [allImages] = useState(() => shuffle(ALL_IMAGES));
  const [sel1, setSel1] = useState(null);
  const [sel2, setSel2] = useState(null);
  const [sel3, setSel3] = useState(null);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [story, setStory] = useState("");
  const [reason, setReason] = useState("");
  const [mood, setMood] = useState("");
  const [moodOther, setMoodOther] = useState("");
  const [age, setAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const images2 = allImages.filter(i => i.id !== sel1?.id);
  const images3 = allImages.filter(i => i.id !== sel1?.id && i.id !== sel2?.id);

  function validateSurvey() {
    const e = {};
    scores.forEach((s, i) => { if (s === 0) e[`q${i}`] = true; });
    if (!reason) e.reason = true;
    if (!mood) e.mood = true;
    if (mood === "其他" && !moodOther) e.moodOther = true;
    if (!age) e.age = true;
    return e;
  }

  async function handleSubmit() {
    const e = validateSurvey();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      alert("有些題目還沒填喔！請檢查紅框處。");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const db = getDatabase();
      await push(ref(db, "surveys"), {
        timestamp: Date.now(),
        mode: "solo",
        imageA: sel1?.id || null,
        imageB: sel2?.id || null,
        imageC: sel3?.id || null,
        q1: scores[0], q2: scores[1], q3: scores[2], q4: scores[3],
        story, reason,
        mood: mood === "其他" ? `其他：${moodOther}` : mood,
        age,
      });
      setSubmitted(true);
    } catch (err) {
      alert("儲存失敗：" + err.message);
    } finally { setSubmitting(false); }
  }

  const stepLabel = (n) => {
    if (step > n) return styles.stepDone;
    if (step === n) return styles.stepActive;
    return {};
  };

  const TopBar = () => (
    <div style={styles.topBar}>
      <span style={styles.title}>屬於你的想像旅程</span>
      <div style={styles.steps}>
        <span style={{...styles.step, ...stepLabel(1)}}>① 第一張</span>
        <span style={{...styles.step, ...stepLabel(2)}}>② 第二張</span>
        <span style={{...styles.step, ...stepLabel(3)}}>③ 第三張</span>
      </div>
    </div>
  );

  // ── 感謝頁 ──
  if (submitted) return (
    <div style={styles.wrapper}>
      <TopBar />
      <div style={styles.center}>
        <div style={styles.bigText}>感謝你的參與</div>
        <div style={styles.smallText}>你的故事已被記錄</div>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://superlative-bienenstitch-9a5f9f.netlify.app/stories" alt="QR" style={{width:140,height:140,margin:"16px 0"}} />
        <div style={styles.smallText}>掃描查看創作者的故事版本</div>
        <button onClick={() => window.location.reload()} style={{...styles.btn, marginTop:16}}>↺ 再玩一次</button>
      </div>
    </div>
  );

  // ── 其他問題頁（step 5）──
  if (step === 5) return (
    <div style={styles.wrapper}>
      <TopBar />
      <div style={styles.surveyScroll}>
        <div style={styles.previewRow}>
          {[sel1, sel2, sel3].map((sel, i) => sel && (
            <div key={i} style={styles.previewThumb}>
              <img src={sel.src} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}} />
              <div style={styles.thumbBadge}>{i+1}</div>
            </div>
          ))}
        </div>

        <div style={styles.surveySectionTitle}>請依真實感受點選 1～5</div>
        {SCALE_QUESTIONS.map((q, qi) => (
          <div key={qi} style={{
            ...styles.scaleRow,
            border: errors[`q${qi}`] ? "1px solid #c00" : "none",
            borderBottom: errors[`q${qi}`] ? "1px solid #c00" : "1px solid rgba(0,0,0,0.06)",
            borderRadius: errors[`q${qi}`] ? 4 : 0,
            padding: errors[`q${qi}`] ? "8px" : "8px 0",
            background: errors[`q${qi}`] ? "rgba(200,0,0,0.03)" : "transparent",
          }}>
            <div style={styles.scaleQ}>{qi+1}. {q}</div>
            <div style={styles.scaleButtons}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => {
                  const s=[...scores]; s[qi]=n; setScores(s);
                  setErrors(prev => ({...prev, [`q${qi}`]: false}));
                }} style={{
                  ...styles.scaleBtn,
                  background: scores[qi]===n ? "#1a1a1a" : "transparent",
                  color: scores[qi]===n ? "#f0ede8" : "rgba(0,0,0,0.4)",
                  borderColor: scores[qi]===n ? "#1a1a1a" : "rgba(0,0,0,0.2)",
                }}>{n}</button>
              ))}
              <span style={styles.scaleHint}>{scores[qi] ? SCALE_LABELS[scores[qi]-1] : ""}</span>
            </div>
          </div>
        ))}

        <div style={styles.surveyLabel}>吸引你選擇某張圖的關鍵原因？</div>
        <textarea value={reason} onChange={e=>{setReason(e.target.value); setErrors(prev=>({...prev,reason:false}));}}
          placeholder="例如：圖一的煙霧感讓我想到⋯請自由發揮，無標準答案"
          style={{...styles.textarea, borderColor: errors.reason ? "#c00" : "rgba(0,0,0,0.15)"}} />

        <div style={styles.surveyLabel}>因你選擇而形成的故事，氛圍你覺得偏向？</div>
        <div style={{ ...styles.moodRow, outline: errors.mood ? "1px solid #c00" : "none", borderRadius:4, padding: errors.mood ? 6 : 0 }}>
          {MOOD_OPTIONS.map(m => (
            <button key={m} onClick={()=>{setMood(m); setErrors(prev=>({...prev,mood:false}));}} style={{
              ...styles.moodBtn,
              background: mood===m ? "#1a1a1a" : "transparent",
              color: mood===m ? "#f0ede8" : "rgba(0,0,0,0.5)",
              borderColor: mood===m ? "#1a1a1a" : "rgba(0,0,0,0.2)",
            }}>{m}</button>
          ))}
        </div>
        {mood === "其他" && (
          <textarea value={moodOther} onChange={e=>{setMoodOther(e.target.value); setErrors(prev=>({...prev,moodOther:false}));}}
            placeholder="請說明你的氛圍感受..."
            style={{...styles.textarea, marginTop:8, borderColor: errors.moodOther ? "#c00" : "rgba(0,0,0,0.15)"}} />
        )}

        <div style={styles.surveyLabel}>您的年齡層？</div>
        <div style={{ ...styles.moodRow, outline: errors.age ? "1px solid #c00" : "none", borderRadius:4, padding: errors.age ? 6 : 0 }}>
          {AGE_OPTIONS.map(a => (
            <button key={a} onClick={()=>{setAge(a); setErrors(prev=>({...prev,age:false}));}} style={{
              ...styles.moodBtn,
              background: age===a ? "#1a1a1a" : "transparent",
              color: age===a ? "#f0ede8" : "rgba(0,0,0,0.5)",
              borderColor: age===a ? "#1a1a1a" : "rgba(0,0,0,0.2)",
            }}>{a}</button>
          ))}
        </div>

        <div style={{display:"flex", justifyContent:"space-between", marginTop:24}}>
          <button onClick={()=>setStep(4)} style={styles.backBtn}>← 上一步</button>
          <button onClick={handleSubmit} disabled={submitting} style={styles.btn}>{submitting?"儲存中...":"送出問卷"}</button>
        </div>
      </div>
    </div>
  );

  // ── 說故事頁（step 4）──
  if (step === 4) return (
    <div style={styles.wrapper}>
      <TopBar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 32px" }}>
        <ThreeImages sel1={sel1} sel2={sel2} sel3={sel3} />
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
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
            <button onClick={()=>setStep(3)} style={styles.backBtn}>← 上一步</button>
            <button
              onClick={() => { if (story.trim()) setStep(5); else alert("請先填寫故事說明！"); }}
              style={styles.btn}
            >
              下一頁 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── 選圖頁（step 1~3）──
  const currentImages = step===1 ? allImages : step===2 ? images2 : images3;
  const currentSel = step===1 ? sel1 : step===2 ? sel2 : sel3;
  const setSel = step===1 ? setSel1 : step===2 ? setSel2 : setSel3;
  const hint = step===1 ? "哪個畫面，先走進你的腦海呢？" : step===2 ? "哪個畫面，繼續走進你的腦海呢？" : "哪個畫面，為你的故事畫下句點？";

  function handleNext() {
    if (step === 1 && sel1) setStep(2);
    else if (step === 2 && sel2) setStep(3);
    else if (step === 3 && sel3) setStep(4);
  }

  function handleBack() {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }

  return (
    <div style={styles.wrapper}>
      <TopBar />
      {step >= 2 && (
        <div style={styles.prevRow}>
          <span style={styles.prevLabel}>已選：</span>
          {step >= 2 && sel1 && <img src={sel1.src} alt="" style={styles.prevThumb} />}
          {step >= 3 && sel2 && <img src={sel2.src} alt="" style={styles.prevThumb} />}
        </div>
      )}
      <div style={styles.hint}>{hint}</div>
      <div style={styles.grid}>
        {currentImages.map(image => {
          const isSelected = currentSel?.id === image.id;
          return (
            <div key={image.id} onClick={() => setSel(image)} style={{
              ...styles.gridItem,
              border: `2px solid ${isSelected ? "#1a1a1a" : "transparent"}`,
              transform: isSelected ? "scale(1.05)" : "scale(1)",
              boxShadow: isSelected ? "0 4px 16px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <img src={image.src} alt="" style={styles.gridImg} draggable={false} />
              {isSelected && <div style={styles.checkBadge}>✓</div>}
            </div>
          );
        })}
      </div>
      <div style={styles.bottomBar}>
        {step > 1 ? <button onClick={handleBack} style={styles.backBtn}>← 上一步</button> : <span />}
        <button onClick={handleNext} disabled={!currentSel} style={{...styles.btn, opacity: currentSel ? 1 : 0.3}}>
          {step === 3 ? "完成，填寫問卷 →" : "下一張 →"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper:{ width:"100vw", minHeight:"100dvh", background:"#f0ede8", display:"flex", flexDirection:"column", fontFamily:"'Shippori Mincho','Hiragino Mincho Pro',serif", userSelect:"none" },
  topBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px 10px", borderBottom:"1px solid rgba(0,0,0,0.08)", flexShrink:0, background:"#f0ede8" },
  title:{ fontSize:12, fontWeight:600, color:"#1a1a1a", letterSpacing:"0.1em" },
  steps:{ display:"flex", gap:6 },
  step:{ fontSize:9, padding:"3px 10px", border:"1px solid rgba(0,0,0,0.2)", color:"rgba(0,0,0,0.35)", letterSpacing:"0.05em" },
  stepActive:{ background:"#1a1a1a", borderColor:"#1a1a1a", color:"#f0ede8", fontWeight:500 },
  stepDone:{ borderColor:"rgba(0,0,0,0.5)", color:"rgba(0,0,0,0.5)", background:"rgba(0,0,0,0.06)" },
  prevRow:{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderBottom:"1px solid rgba(0,0,0,0.06)" },
  prevLabel:{ fontSize:10, color:"rgba(0,0,0,0.35)" },
  prevThumb:{ width:40, height:40, objectFit:"contain", background:"#fff", borderRadius:3, border:"1px solid rgba(0,0,0,0.1)" },
  hint:{ fontSize:10, color:"rgba(0,0,0,0.3)", padding:"8px 16px 4px", letterSpacing:"0.08em" },
  grid:{ flex:1, display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, padding:"8px 16px", overflowY:"auto" },
  gridItem:{ position:"relative", borderRadius:4, overflow:"hidden", background:"#f5f2ee", cursor:"pointer", transition:"transform 0.3s, box-shadow 0.2s, border-color 0.2s", aspectRatio:"1" },
  gridImg:{ width:"100%", height:"100%", objectFit:"contain", background:"#fff", display:"block" },
  checkBadge:{ position:"absolute", top:4, right:4, width:18, height:18, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#f0ede8", fontWeight:700 },
  bottomBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderTop:"1px solid rgba(0,0,0,0.08)", flexShrink:0 },
  btn:{ fontSize:11, padding:"10px 24px", border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#f0ede8", cursor:"pointer", letterSpacing:"0.1em" },
  backBtn:{ fontSize:11, padding:"10px 16px", border:"1px solid rgba(0,0,0,0.3)", background:"transparent", color:"rgba(0,0,0,0.5)", cursor:"pointer", letterSpacing:"0.1em" },
  center:{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:24 },
  bigText:{ fontSize:20, letterSpacing:"0.2em", color:"#1a1a1a" },
  smallText:{ fontSize:11, color:"rgba(0,0,0,0.4)", letterSpacing:"0.1em" },
  surveyScroll:{ flex:1, overflowY:"auto", padding:"16px 16px 40px", display:"flex", flexDirection:"column", gap:14 },
  previewRow:{ display:"flex", gap:10, justifyContent:"center", marginBottom:8 },
  previewThumb:{ width:80, height:80, position:"relative", background:"#fff", borderRadius:4, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" },
  thumbBadge:{ position:"absolute", top:3, left:3, width:14, height:14, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#f0ede8", fontWeight:700 },
  surveySectionTitle:{ fontSize:10, color:"rgba(0,0,0,0.4)", letterSpacing:"0.08em" },
  scaleRow:{ display:"flex", flexDirection:"column", gap:6, padding:"8px 0" },
  scaleQ:{ fontSize:11, color:"#1a1a1a", letterSpacing:"0.04em", lineHeight:1.6 },
  scaleButtons:{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" },
  scaleBtn:{ width:36, height:36, border:"1px solid", fontSize:12, cursor:"pointer", flexShrink:0 },
  scaleHint:{ fontSize:10, color:"rgba(0,0,0,0.4)" },
  surveyLabel:{ fontSize:12, color:"#1a1a1a", letterSpacing:"0.05em", lineHeight:1.6, marginTop:8 },
  textarea:{ width:"100%", minHeight:60, padding:"8px 10px", border:"1px solid rgba(0,0,0,0.15)", background:"#fff", fontSize:12, fontFamily:"'Shippori Mincho',serif", resize:"vertical", boxSizing:"border-box" },
  moodRow:{ display:"flex", flexWrap:"wrap", gap:8 },
  moodBtn:{ fontSize:11, padding:"6px 14px", border:"1px solid", cursor:"pointer", letterSpacing:"0.05em" },
};