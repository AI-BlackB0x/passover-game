(() => {

/* ══════════════════════════════════════════
   SLIDES DATA
══════════════════════════════════════════ */
const slides = [
  {
    type: "intro",
    img: "images/slide_01.jpg.png",
    narration: "ברוכים הבאים לפסח של מספרים! לומדים חיבור וחיסור עם משה, מרים וההגדה. לחצו על התחל משחק!"
  },
  {
    type: "q", id: 1,
    img: "images/slide_q1.jpg.png",
    story: "בצלחת של דני היו 3 מצות.\nאמא הוסיפה לו עוד 2 מצות.\nכמה מצות יש לדני בסך הכל?",
    narration: "בצלחת של דני היו 3 מצות. אמא הוסיפה לו עוד 2 מצות. כמה מצות יש לדני בסך הכל?",
    a: 3, b: 2, op: "+", correct: 5
  },
  {
    type: "q", id: 2,
    img: "images/slide_q2.png",
    story: "בוני הפירמידות בנו 7 פירמידות גדולות.\nרוח חזקה הפילה 3 פירמידות.\nכמה פירמידות נשארו עומדות?",
    narration: "בוני הפירמידות בנו 7 פירמידות גדולות. רוח חזקה הפילה 3 פירמידות. כמה פירמידות נשארו עומדות?",
    a: 7, b: 3, op: "−", correct: 4
  },
  {
    type: "q", id: 3,
    img: "images/slide_q3.png",
    story: "על שולחן הסדר הניחו 4 כוסות יין מצד ימין\nו-4 כוסות יין מצד שמאל.\nכמה כוסות יש על השולחן?",
    narration: "על שולחן הסדר הניחו 4 כוסות יין מצד ימין ו-4 כוסות יין מצד שמאל. כמה כוסות יש על השולחן?",
    a: 4, b: 4, op: "+", correct: 8
  },
  {
    type: "q", id: 4,
    img: "images/slide_q4.png",
    story: "סבא החביא 10 מתנות קטנות לאפיקומן.\nהילדים מצאו כבר 6 מתנות.\nכמה מתנות עוד נשארו חבויות?",
    narration: "סבא החביא 10 מתנות קטנות לאפיקומן. הילדים מצאו כבר 6 מתנות. כמה מתנות עוד נשארו חבויות?",
    a: 10, b: 6, op: "−", correct: 4
  },
  {
    type: "summary",
    img: "images/slide_summary.png",
    narration: "תראו כמה דברים ספרנו הלילה! 5 מצות, 4 פירמידות, 8 כוסות יין, ו-4 מתנות. מדהים!"
  },
  {
    type: "final",
    img: "images/slide_end.png",
    narration: "כל הכבוד! אתם אלופי החשבון של פסח! חג שמח וכשר לכולם!"
  }
];

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let idx = 0, score = 0;
let hasUserGesture = false, narrationEnabled = true;

const mainCard     = document.getElementById("mainCard");
const bar          = document.getElementById("bar");
const progressText = document.getElementById("progressText");
const scoreChip    = document.getElementById("scoreChip");
const confettiEl   = document.getElementById("confetti");
const narTog       = document.getElementById("narrationToggle");

/* ══════════════════════════════════════════
   AUDIO
══════════════════════════════════════════ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
}

function tone({ freq=440, dur=.12, type="sine", gain=.05 }) {
  try {
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}

function successSound() {
  tone({freq:523.25, dur:.09, type:"triangle", gain:.045});
  setTimeout(() => tone({freq:659.25, dur:.09, type:"triangle", gain:.045}), 90);
  setTimeout(() => tone({freq:783.99, dur:.12, type:"triangle", gain:.045}), 180);
  setTimeout(() => tone({freq:1046.5, dur:.18, type:"triangle", gain:.04}),  300);
}

function errorSound() {
  tone({freq:220, dur:.10, gain:.03});
  setTimeout(() => tone({freq:196, dur:.12, gain:.03}), 110);
}

/* ══════════════════════════════════════════
   TTS
══════════════════════════════════════════ */
function primeVoices() {
  if (!("speechSynthesis" in window)) return Promise.resolve();
  return new Promise(r => {
    let done = false;
    const fin = () => { if (done) return; done = true; r(); };
    try { speechSynthesis.getVoices(); } catch(e) {}
    if ((speechSynthesis.getVoices?.() || []).length) return fin();
    const t = setTimeout(fin, 800);
    speechSynthesis.onvoiceschanged = () => { clearTimeout(t); fin(); };
  });
}

function heVoice() {
  const vs = speechSynthesis.getVoices?.() || [];
  const he = vs.filter(v => v.lang.toLowerCase().startsWith("he"));
  return he.find(v => /hila|avri/i.test(v.name)) ||
         he.find(v => /neural|natural/i.test(v.name)) ||
         he.find(v => v.lang.toLowerCase() === "he-il") ||
         he[0] || null;
}

let speakChain = Promise.resolve();

function speak(text, { force=false } = {}) {
  if (!("speechSynthesis" in window) || !narrationEnabled) return speakChain;
  if (!force && !hasUserGesture) return speakChain;
  speakChain = speakChain.then(async () => {
    await primeVoices();
    try { speechSynthesis.cancel(); } catch(e) {}
    await new Promise(r => setTimeout(r, 55));
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "he-IL"; u.rate = .95; u.pitch = 1.06; u.volume = 1;
      const v = heVoice(); if (v) u.voice = v;
      speechSynthesis.speak(u);
      await new Promise(r => { u.onend = r; u.onerror = r; setTimeout(r, 6000); });
    } catch(e) {}
  });
  return speakChain;
}

narTog.addEventListener("click", () => {
  hasUserGesture = true;
  narrationEnabled = !narrationEnabled;
  narTog.textContent = narrationEnabled ? "קריינות: פועלת 🔊" : "קריינות: כבויה 🔇";
  if (!narrationEnabled && "speechSynthesis" in window) { try { speechSynthesis.cancel(); } catch(e) {} }
  else if (narrationEnabled) { ensureAudio(); speak("הקריינות הופעלה", {force:true}); }
});

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function setProgress() {
  const totalQ = slides.filter(s => s.type === "q").length;
  const done   = slides.slice(0, idx).filter(s => s.type === "q").length;
  bar.style.width = (idx === 0 ? 0 : Math.round(done / totalQ * 100)) + "%";
  const s = slides[idx];
  if (!s) { progressText.textContent = ""; return; }
  if (s.type === "intro")        progressText.textContent = "מוכנים?";
  else if (s.type === "q")       progressText.textContent = `שאלה ${s.id} מתוך ${totalQ}`;
  else if (s.type === "summary") progressText.textContent = "סיכום";
  else                           progressText.textContent = "🏆 סיום חגיגי!";
}

function setScore() { scoreChip.textContent = `⭐ ניקוד: ${score}`; }

function shuffle(a) {
  const b = a.slice();
  for (let i = b.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [b[i],b[j]] = [b[j],b[i]];
  }
  return b;
}

function makeChoices(c) {
  const s = new Set([c]);
  while (s.size < 5) s.add(Math.floor(Math.random()*13));
  return shuffle([...s]);
}

/* ══════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════ */
function burst() {
  confettiEl.innerHTML = "";
  const cols = ["#e84040","#fdd835","#2ecc71","#2196f3","#9c27b0","#fff","#c8941c","#ff9ff3"];
  for (let i = 0; i < 52; i++) {
    const p = document.createElement("i");
    p.style.cssText = `
      left:${Math.random()*100}%;
      animation-delay:${Math.random()*80}ms;
      animation-duration:${700+Math.random()*380}ms;
      width:${6+Math.random()*10}px; height:${10+Math.random()*14}px;
      background:${cols[Math.floor(Math.random()*cols.length)]};
      transform:rotate(${Math.random()*180}deg);
      border-radius:${Math.random()>.5?"50%":"4px"};
    `;
    confettiEl.appendChild(p);
  }
  setTimeout(() => confettiEl.innerHTML = "", 1200);
}

/* ══════════════════════════════════════════
   RENDER
══════════════════════════════════════════ */
function render() {
  setProgress(); setScore();
  const s = slides[idx];

  /* ── INTRO ── */
  if (s.type === "intro") {
    mainCard.innerHTML = `
      <img class="slideImg" src="${s.img}" alt="פסח של מספרים - מסך פתיחה">
      <div class="ctaRow">
        <button class="btn btnPrimary" id="startBtn">🚀 התחל משחק!</button>
      </div>
    `;
    document.getElementById("startBtn").addEventListener("click", async () => {
      hasUserGesture = true; ensureAudio(); await primeVoices();
      await speak(s.narration, {force:true});
      idx = 1; render();
    }, {once:true});
    return;
  }

  /* ── SUMMARY ── */
  if (s.type === "summary") {
    mainCard.innerHTML = `
      <img class="slideImg" src="${s.img}" alt="סיכום">
      <div class="ctaRow">
        <button class="btn btnContinue" id="continueBtn">המשך ▶</button>
      </div>
    `;
    speak(s.narration);
    document.getElementById("continueBtn").addEventListener("click", () => {
      hasUserGesture = true; ensureAudio(); idx++; render();
    }, {once:true});
    return;
  }

  /* ── FINAL ── */
  if (s.type === "final") {
    const stars = score === 4 ? "🌟🌟🌟🌟" : score >= 2 ? "⭐⭐" : "⭐";
    mainCard.innerHTML = `
      <img class="slideImg" src="${s.img}" alt="מסך סיום">
      <span class="finalScore">${score} / 4</span>
      <p class="subtitle" style="font-size:clamp(20px,3vw,28px);margin:4px 0 12px">${stars}</p>
      <div class="ctaRow">
        <button class="btn btnSecondary" id="restartBtn">🔄 שחקו שוב</button>
      </div>
    `;
    speak(s.narration);
    document.getElementById("restartBtn").addEventListener("click", () => {
      hasUserGesture = true; ensureAudio(); score = 0; idx = 0; render();
    });
    return;
  }

  /* ── QUESTION ── */
  const choices = makeChoices(s.correct);

  mainCard.innerHTML = `
    <img class="slideImg" src="${s.img}" alt="שאלה ${s.id}">
    <div class="eqRow">
      <span class="eqN">${s.a}</span>
      <span class="eqOp">${s.op}</span>
      <span class="eqN">${s.b}</span>
      <span class="eqOp">=</span>
      <span class="eqQ">?</span>
    </div>
    <div class="choices" id="choices" role="group" aria-label="תשובות">
      ${choices.map(n => `<button class="choice" data-val="${n}">${n}</button>`).join("")}
    </div>
    <div class="message" id="msg" aria-live="polite"></div>
  `;

  speak(s.narration);

  const msg  = document.getElementById("msg");
  const btns = [...document.querySelectorAll(".choice")];

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      hasUserGesture = true; ensureAudio();
      const val = Number(btn.dataset.val);

      if (val === s.correct) {
        msg.textContent = "✅ נכון! כל הכבוד!";
        msg.className   = "message ok";
        if ("speechSynthesis" in window) { try { speechSynthesis.cancel(); } catch(e) {} }
        successSound();
        burst();
        btns.forEach(b => { b.disabled = true; });
        const praises = ["אלוף!", "מצוין!", "נכון מאוד!", "כל הכבוד!", "מדהים!", "וואו, נכון!", "אלופה!", "פנטסטי!"];
        speak(praises[Math.floor(Math.random() * praises.length)]);
        score++;
        setScore();
        setTimeout(() => { idx++; render(); }, 2000);

      } else {
        msg.textContent = "❌ לא נורא — נסו שוב!";
        msg.className   = "message bad";
        errorSound();
        setTimeout(() => speak("נסו שוב"), 120);
        btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
      }
    });
  });
}

render();
})();
