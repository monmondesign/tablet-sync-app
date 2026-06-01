import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

export default function Admin() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const surveysRef = ref(db, "surveys");
    onValue(surveysRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]) => ({
          key,
          ...val,
          time: new Date(val.timestamp).toLocaleString("zh-TW"),
        }));
        setSurveys(list.reverse());
      } else {
        setSurveys([]);
      }
      setLoading(false);
    });
  }, []);

  function downloadCSV() {
    const headers = ["時間", "圖A", "圖B", "圖C", "Q1", "Q2", "Q3", "Q4", "故事", "選擇原因", "氛圍", "年齡"];
    const rows = surveys.map(s => [
      s.time, s.imageA, s.imageB, s.imageC,
      s.q1, s.q2, s.q3, s.q4,
      `"${(s.story || "").replace(/"/g, '""')}"`,
      `"${(s.reason || "").replace(/"/g, '""')}"`,
      s.mood, s.age
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `問卷資料_${new Date().toLocaleDateString("zh-TW")}.csv`;
    a.click();
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.title}>問卷後台</div>
          <div style={styles.count}>{loading ? "載入中..." : `共 ${surveys.length} 筆資料`}</div>
        </div>
        <button onClick={downloadCSV} disabled={surveys.length === 0} style={styles.downloadBtn}>
          下載 Excel (CSV)
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>載入中...</div>
      ) : surveys.length === 0 ? (
        <div style={styles.empty}>目前還沒有問卷資料</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["時間", "圖A", "圖B", "圖C", "Q1", "Q2", "Q3", "Q4", "故事", "選擇原因", "氛圍", "年齡"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {surveys.map((s, i) => (
                <tr key={s.key} style={{background: i % 2 === 0 ? "#fff" : "#f9f7f5"}}>
                  <td style={styles.td}>{s.time}</td>
                  <td style={styles.td}>{s.imageA}</td>
                  <td style={styles.td}>{s.imageB}</td>
                  <td style={styles.td}>{s.imageC}</td>
                  <td style={{...styles.td, textAlign:"center"}}>{s.q1}</td>
                  <td style={{...styles.td, textAlign:"center"}}>{s.q2}</td>
                  <td style={{...styles.td, textAlign:"center"}}>{s.q3}</td>
                  <td style={{...styles.td, textAlign:"center"}}>{s.q4}</td>
                  <td style={{...styles.td, maxWidth:200}}>{s.story}</td>
                  <td style={{...styles.td, maxWidth:200}}>{s.reason}</td>
                  <td style={styles.td}>{s.mood}</td>
                  <td style={styles.td}>{s.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper:{ minHeight:"100vh", background:"#f0ede8", fontFamily:"'Shippori Mincho', 'Hiragino Mincho Pro', serif" },
  header:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 32px", borderBottom:"1px solid rgba(0,0,0,0.08)", background:"#f0ede8" },
  headerLeft:{ display:"flex", flexDirection:"column", gap:4 },
  title:{ fontSize:18, fontWeight:600, color:"#1a1a1a", letterSpacing:"0.15em" },
  count:{ fontSize:11, color:"rgba(0,0,0,0.4)", letterSpacing:"0.08em" },
  downloadBtn:{ fontSize:12, padding:"10px 24px", borderRadius:0, border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#f0ede8", cursor:"pointer", letterSpacing:"0.1em" },
  loading:{ padding:40, textAlign:"center", fontSize:13, color:"rgba(0,0,0,0.4)" },
  empty:{ padding:40, textAlign:"center", fontSize:13, color:"rgba(0,0,0,0.4)" },
  tableWrap:{ overflowX:"auto", padding:"24px 32px" },
  table:{ width:"100%", borderCollapse:"collapse", fontSize:11 },
  th:{ padding:"10px 12px", background:"#1a1a1a", color:"#f0ede8", textAlign:"left", letterSpacing:"0.08em", fontWeight:500, whiteSpace:"nowrap" },
  td:{ padding:"10px 12px", borderBottom:"1px solid rgba(0,0,0,0.06)", color:"#1a1a1a", verticalAlign:"top", lineHeight:1.6 },
};