export default function Stories() {
  const stories = [
    {
      title: "燃盡",
      images: ["/images/candle_001.png", "/images/candle_002.png", "/images/candle_003.png"],
      content: `有些人，是帶著光來到這個世界的。
他們燃燒，不為自己，只為讓周圍亮一點。
從挺立、到滴落、到消逝，
直到最後一滴，才安靜地熄滅。`,
    },
    {
      title: "光鮮",
      images: ["/images/cat_enjoy_001.png", "/images/cat_enjoy_002.png", "/images/cat_enjoy_003.png"],
      content: `鏡頭前，是美酒、是瀟灑、是令人羨慕的人生。
但鏡頭關掉之後，
不過是一隻窩在角落、什麼都不想動的貓。

我們花了多少力氣，
只為了讓別人以為，我們過得很好？`,
    },
    {
      title: "當機",
      images: ["/images/dog_work_001.png", "/images/dog_work_002.png", "/images/dog_work_003.png"],
      content: `打開電腦，許願今天思緒清晰、文思泉湧。
越想專注，越是一片空白。
越想寫出什麼，越是什麼都擠不出來。

最後憤怒的，不是電腦，
是那個對自己用力過猛、卻毫無收穫的自己。`,
    },
    {
      title: "意外的禮物",
      images: ["/images/giraffe_001.png", "/images/giraffe_002.png", "/images/giraffe_003.png"],
      content: `長頸鹿只是難受，只是忍不住，
牠從來不知道，那一個噴嚏，
落在了某朵花的葉片上。

花以為是雨，喝飽了，開心地盛開。

世界上有多少這樣的事？
有人無意間說了一句話，做了一個動作，
卻在某個陌生的角落，
悄悄成為了另一個人繼續下去的理由。

給予者不知道，接受者卻記了一輩子。`,
    },
    {
      title: "刺",
      images: ["/images/hedgehog_and_balloon_001.png", "/images/hedgehog_and_balloon_002.png", "/images/hedgehog_and_balloon_003.png"],
      content: `刺蝟第一次看到氣球，就知道結局了。
所以牠選擇不靠近。

但氣球不懂，或者說，氣球不在乎。
牠只是一直飄，一直靠近，一直笑。

「砰」的一聲之後，
刺蝟站在原地，一動也不動。

不是因為不難過，
而是牠早就知道，
有些人，你只能遠遠地喜歡。
靠近，是一種傷害。`,
    },
    {
      title: "囚愛",
      images: ["/images/love_or_not_001.png", "/images/love_or_not_002.png", "/images/love_or_not_003.png"],
      content: `有人愛一朵花，愛到每天澆水、細心呵護。
花在陽光裡盛開，以為這就是幸福。

但愛有時候會變質，
「我這麼愛你，你只能是我的。」
於是籠子落下來了。

花沒有離開，陽光卻再也照不進來。

越想永遠擁有的，
往往親手讓它凋零。

真正的愛，
或許是捨得讓它繼續在風裡搖曳。`,
    },
    {
      title: "善意的沙坑",
      images: ["/images/robot_and_fish_001.png", "/images/robot_and_fish_002.png", "/images/robot_and_fish_003.png"],
      content: `機器人看見魚被困在小小的魚缸裡，
心裡只有一個念頭，
牠需要更大的地方。

於是牠伸出手，把魚撈了出來。
給了牠「自由」，給了牠「空間」。

那是一個沙坑。

機器人沒有惡意，牠只是不懂。
但有時候「不懂」比「壞心」更致命，
壞心你可以防，
充滿善意的誤解，你連躲都不知道怎麼躲。

你以為的拯救，
可能是對方最後一口氣。

愛一個人之前，
請先試著理解他真正需要什麼。`,
    },
  ];

  return (
    <div style={styles.outer}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>我所看見的故事</div>
          <div style={styles.headerSub}>這是創作者心中的其中一個故事。你的版本，同樣真實。</div>
        </div>
        <div style={styles.body}>
          {stories.map((s, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardTitle}>{s.title}</div>
              <div style={styles.imageRow}>
                {s.images.map((src, j) => (
                  <div key={j} style={styles.imageWrap}>
                    <div style={styles.orderBadge}>{j + 1}</div>
                    <img src={src} alt="" style={styles.image} />
                  </div>
                ))}
              </div>
              <div style={styles.cardContent}>{s.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  outer:{ position:"fixed", top:0, left:0, right:0, bottom:0, overflowY:"scroll", WebkitOverflowScrolling:"touch", background:"#f0ede8" },
  inner:{ fontFamily:"'Shippori Mincho', 'Hiragino Mincho Pro', serif" },
  header:{ padding:"32px 24px 20px", borderBottom:"1px solid rgba(0,0,0,0.08)", background:"#f0ede8" },
  headerTitle:{ fontSize:16, fontWeight:600, color:"#1a1a1a", letterSpacing:"0.2em", marginBottom:6 },
  headerSub:{ fontSize:11, color:"rgba(0,0,0,0.4)", letterSpacing:"0.08em", lineHeight:1.8 },
  body:{ padding:"20px 16px 60px", display:"flex", flexDirection:"column", gap:24 },
  card:{ background:"#fff", padding:"20px 16px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)" },
  cardTitle:{ fontSize:13, fontWeight:600, color:"#1a1a1a", letterSpacing:"0.15em", marginBottom:14, paddingBottom:10, borderBottom:"1px solid rgba(0,0,0,0.06)" },
  imageRow:{ display:"flex", flexDirection:"row", gap:8, marginBottom:14, justifyContent:"center" },
  imageWrap:{ flex:1, maxWidth:160, aspectRatio:"1", position:"relative", background:"#f0ede8", overflow:"hidden" },
  orderBadge:{ position:"absolute", top:4, left:4, width:14, height:14, background:"#1a1a1a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#f0ede8", fontWeight:700, zIndex:1 },
  image:{ width:"100%", height:"100%", objectFit:"contain", background:"#fff", display:"block" },
  cardContent:{ fontSize:12, color:"rgba(0,0,0,0.65)", lineHeight:2.2, letterSpacing:"0.06em", whiteSpace:"pre-wrap", background:"rgba(0,0,0,0.02)", padding:"12px 16px" },
};