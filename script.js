const slides = Array.from(document.querySelectorAll(".slide"));
const progressBar = document.getElementById("progressBar");
const slideCounter = document.getElementById("slideCounter");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const notesBtn = document.getElementById("notesBtn");
const notesPanel = document.getElementById("speakerNotes");
const notesText = document.getElementById("notesText");
const emotionPrompt = document.getElementById("emotionPrompt");
const breathButton = document.getElementById("breathButton");
const breathInstruction = document.getElementById("breathInstruction");
const breathCount = document.getElementById("breathCount");

let currentSlide = 0;
let selectedEmotion = "alegria";
let breathPhase = "idle";
let breathRunning = false;
let breathProgress = 0;
let breathStartAt = 0;
let breathMood = 0;
let breathColor = "#ef3340";

const themes = ["intro", "emotions", "body", "office", "bigdragon", "breath", "tools", "finale"];

function showSlide(index) {
  currentSlide = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === currentSlide);
  });
  progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
  slideCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === slides.length - 1;
  notesText.textContent = slides[currentSlide].dataset.notes || "";
  history.replaceState(null, "", `#slide-${currentSlide + 1}`);

  if (themes[currentSlide] !== "breath") resetBreath();
}

function setBreathState(phase, value, text) {
  breathPhase = phase;
  breathCount.textContent = value;
  breathInstruction.textContent = text;
}

function startBreath() {
  if (breathRunning) {
    resetBreath();
    return;
  }
  breathRunning = true;
  breathStartAt = performance.now();
  breathProgress = 0;
  breathMood = 0;
  breathColor = "#ef3340";
  breathButton.textContent = "Parar";
  setBreathState("inhale", "4", "Inspira: o dragão bravo vai ficando lilás.");
}

function resetBreath() {
  breathRunning = false;
  breathProgress = 0;
  breathMood = 0;
  breathStartAt = 0;
  breathColor = "#ef3340";
  breathButton.textContent = "Começar respiração";
  setBreathState("idle", "4", "O dragão começa bravo. Vamos acalmar juntos?");
}

document.querySelectorAll("[data-emotion]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedEmotion = button.dataset.emotion;
    document.querySelectorAll("[data-emotion]").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    emotionPrompt.textContent = `Agora todo mundo faz cara de ${selectedEmotion} comigo.`;
  });
});

prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
breathButton.addEventListener("click", startBreath);
notesBtn.addEventListener("click", () => notesPanel.classList.toggle("open"));

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    showSlide(currentSlide + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showSlide(currentSlide - 1);
  }
  if (event.key.toLowerCase() === "r") {
    notesPanel.classList.toggle("open");
  }
});

const initialSlide = Number((location.hash.match(/\d+/) || [1])[0]) - 1;
showSlide(initialSlide);

new p5((p) => {
  let particles = [];

  p.setup = () => {
    const host = document.getElementById("canvasHost");
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent(host);
    p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    particles = Array.from({ length: 42 }, () => makeParticle());
  };

  p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);

  p.draw = () => {
    const theme = themes[currentSlide];
    drawBackground(theme);
    particles.forEach(drawParticle);
    drawScene(theme);
  };

  function makeParticle() {
    return {
      x: p.random(p.width),
      y: p.random(p.height),
      r: p.random(5, 18),
      s: p.random(.2, .8),
      c: p.random(["#ffd400", "#ef3340", "#0057ff", "#00a95c", "#ffffff"])
    };
  }

  function drawBackground(theme) {
    const palettes = {
      intro: ["#0b63ff", "#2cb5ff"],
      emotions: ["#083da8", "#0ba6ff"],
      body: ["#0b615c", "#00a95c"],
      office: ["#1432a6", "#8057ff"],
      bigdragon: ["#071f5f", "#ef3340"],
      breath: ["#0b63ff", "#1bd3a6"],
      tools: ["#123ba8", "#ffd400"],
      finale: ["#0f3f9e", "#00a95c"]
    };
    const [a, b] = palettes[theme] || palettes.intro;
    const gradient = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
    gradient.addColorStop(0, a);
    gradient.addColorStop(1, b);
    p.drawingContext.fillStyle = gradient;
    p.drawingContext.fillRect(0, 0, p.width, p.height);
    p.noStroke();
    glow(p.width * .08, p.height * .14, p.width * .18, "#ffd400", .52);
    glow(p.width * .9, p.height * .18, p.width * .14, "#00a95c", .46);
    glow(p.width * .78, p.height * .78, p.width * .22, "#ffffff", .12);
  }

  function glow(x, y, r, color, alpha) {
    for (let i = 7; i > 0; i -= 1) {
      p.fill(`${color}${Math.floor(alpha * 255 / i).toString(16).padStart(2, "0")}`);
      p.circle(x, y, r * i / 3);
    }
  }

  function drawParticle(dot) {
    dot.y -= dot.s;
    dot.x += Math.sin((p.frameCount + dot.r) * .015) * .25;
    if (dot.y < -40) {
      dot.y = p.height + 40;
      dot.x = p.random(p.width);
    }
    p.noStroke();
    p.fill(dot.c + "55");
    p.circle(dot.x, dot.y, dot.r);
  }

  function drawScene(theme) {
    if (theme === "intro") drawTherapistScene();
    if (theme === "emotions") drawEmotionFaces();
    if (theme === "body") drawBodyMap();
    if (theme === "office") drawOffice();
    if (theme === "bigdragon") drawBigDragon();
    if (theme === "breath") drawBreathingDragon();
    if (theme === "tools") drawToolIcons();
    if (theme === "finale") drawMedal();
  }

  function drawTherapistScene() {
    const mobile = p.width < 700;
    const x = p.width * (mobile ? .5 : .8);
    const y = p.height * (mobile ? .62 : .58);
    drawPerson(x - (mobile ? 70 : 115), y + 10, mobile ? .72 : .9, "#ef3340", "adult");
    drawPerson(x + (mobile ? 58 : 65), y + 55, mobile ? .5 : .62, "#ffd400", "child");
    drawBlocks(x - (mobile ? 140 : 210), y + (mobile ? 135 : 170));
    drawSoftArc(x - (mobile ? 70 : 150), y - (mobile ? 130 : 170), mobile ? 130 : 170);
  }

  function drawPerson(x, y, scale, shirt, type) {
    p.push();
    p.translate(x, y);
    p.scale(scale);
    p.noStroke();
    p.fill(0, 0, 0, 45);
    p.ellipse(10, 180, 170, 36);
    p.stroke("#162033");
    p.strokeWeight(5);
    p.fill(type === "adult" ? "#1d2442" : "#7b4b2f");
    p.arc(0, -60, 112, 118, p.PI, 0);
    p.fill("#ffd8b0");
    p.circle(0, -42, 92);
    p.fill("#162033");
    p.noStroke();
    p.circle(-18, -47, 8);
    p.circle(18, -47, 8);
    p.noFill();
    p.stroke("#162033");
    p.strokeWeight(4);
    p.arc(0, -32, 30, 18, 0, p.PI);
    p.fill(shirt);
    p.rect(-58, 8, 116, 136, 34);
    p.pop();
  }

  function drawBlocks(x, y) {
    p.push();
    p.translate(x, y);
    p.stroke("#162033");
    p.strokeWeight(5);
    p.fill("#ffd400");
    p.rotate(-.14);
    p.rect(0, 0, 74, 74, 10);
    p.rotate(.3);
    p.fill("#00a95c");
    p.rect(95, -10, 74, 74, 10);
    p.pop();
  }

  function drawSoftArc(x, y, size) {
    p.noFill();
    p.strokeWeight(16);
    p.stroke("#ffd400");
    p.arc(x, y, size, size, p.PI, 0);
    p.stroke("#ef3340");
    p.arc(x, y, size - 46, size - 46, p.PI, 0);
  }

  function drawEmotionFaces() {
    const mobile = p.width < 700;
    const items = mobile ? [
      ["alegria", "#ffd400", p.width * .24, p.height * .55],
      ["tristeza", "#0057ff", p.width * .74, p.height * .55],
      ["raiva", "#ef3340", p.width * .25, p.height * .75],
      ["medo", "#00a95c", p.width * .74, p.height * .75]
    ] : [
      ["alegria", "#ffd400", p.width * .76, p.height * .36],
      ["tristeza", "#0057ff", p.width * .9, p.height * .45],
      ["raiva", "#ef3340", p.width * .66, p.height * .72],
      ["medo", "#00a95c", p.width * .86, p.height * .70]
    ];
    items.forEach(([name, color, x, y], i) => {
      const active = selectedEmotion === name;
      drawFace(x, y + Math.sin(p.frameCount * .03 + i) * 8, mobile ? (active ? 62 : 52) : (active ? 92 : 76), color, name);
    });
  }

  function drawFace(x, y, r, color, mood) {
    p.push();
    p.noStroke();
    p.fill(0, 0, 0, 45);
    p.circle(x + 14, y + 18, r * 2);
    p.stroke("#162033");
    p.strokeWeight(5);
    p.fill(color);
    p.circle(x, y, r * 2);
    p.fill("#162033");
    p.noStroke();
    p.circle(x - r * .32, y - r * .18, 8);
    p.circle(x + r * .32, y - r * .18, 8);
    p.noFill();
    p.stroke("#162033");
    p.strokeWeight(5);
    if (mood === "alegria") p.arc(x, y + r * .02, r * .78, r * .55, 0, p.PI);
    if (mood === "tristeza") p.arc(x, y + r * .36, r * .72, r * .48, p.PI, 0);
    if (mood === "raiva") {
      p.line(x - r * .45, y - r * .4, x - r * .14, y - r * .28);
      p.line(x + r * .45, y - r * .4, x + r * .14, y - r * .28);
      p.line(x - r * .34, y + r * .35, x + r * .34, y + r * .35);
    }
    if (mood === "medo") p.ellipse(x, y + r * .24, r * .38, r * .48);
    p.pop();
  }

  function drawBodyMap() {
    const mobile = p.width < 700;
    const x = p.width * (mobile ? .5 : .75);
    const y = p.height * (mobile ? .66 : .58);
    drawPerson(x, y, mobile ? .82 : 1.08, "#ffd400", "child");
    pulseCircle(x, y + (mobile ? 54 : 66), mobile ? 34 : 46, "#ef3340");
    if (mobile) return;
    labelBubble("coração", p.width * .62, p.height * .47, "#ef3340");
    labelBubble("barriga", p.width * .88, p.height * .48, "#ffd400");
    labelBubble("lágrimas", p.width * .55, p.height * .72, "#0057ff");
    labelBubble("calor", p.width * .88, p.height * .75, "#00a95c");
  }

  function labelBubble(text, x, y, color) {
    p.noStroke();
    p.fill(0, 0, 0, 36);
    p.rect(x - 74, y + 8, 148, 54, 20);
    p.fill(color);
    p.rect(x - 74, y, 148, 54, 20);
    p.fill(color === "#ffd400" ? "#162033" : "#fff");
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(18);
    p.text(text, x, y + 27);
  }

  function pulseCircle(x, y, r, color) {
    const pulse = 1 + Math.sin(p.frameCount * .12) * .12;
    p.noStroke();
    p.fill(color + "66");
    p.circle(x, y, r * 2.2 * pulse);
    p.fill(color);
    p.circle(x, y, r);
  }

  function drawOffice() {
    const mobile = p.width < 700;
    const x = p.width * (mobile ? .52 : .73);
    const y = p.height * (mobile ? .66 : .55);
    p.noStroke();
    p.fill(255, 255, 255, 55);
    p.rect(x - 260, y - 120, 520, 310, 36);
    drawPerson(x - (mobile ? 72 : 115), y + 10, mobile ? .62 : .84, "#0057ff", "adult");
    drawPerson(x + (mobile ? 72 : 105), y + 45, mobile ? .48 : .65, "#00a95c", "child");
    drawBlocks(x - 10, y + (mobile ? 100 : 130));
    drawSoftArc(x + (mobile ? 42 : 70), y - (mobile ? 92 : 105), mobile ? 112 : 150);
  }

  function drawBigDragon() {
    const mobile = p.width < 700;
    const breath = .06 + Math.sin(p.frameCount * .08) * .025;
    drawDragon(p.width * (mobile ? .54 : .8), p.height * (mobile ? .68 : .63), Math.min(p.width, p.height) * (mobile ? .46 : .5), "#ef3340", breath, true);
    for (let i = 0; i < 5; i += 1) {
      drawSpark(p.width * (.57 + i * .075), p.height * (.32 + (i % 2) * .43), 24 + i * 4);
    }
  }

  function drawBreathingDragon() {
    const mobile = p.width < 700;
    updateBreathTimeline();
    drawDragon(p.width * (mobile ? .34 : .58), p.height * (mobile ? .46 : .46), Math.min(p.width, p.height) * (mobile ? .38 : .48), breathColor, breathProgress, false, breathMood);
    if (breathPhase === "exhale") {
      for (let i = 0; i < 5; i += 1) {
        const drift = (p.frameCount * 2 + i * 34) % 170;
        p.noStroke();
        p.fill(255, 255, 255, 130 - i * 10);
        p.circle(p.width * (mobile ? .55 : .74) + drift, p.height * .4 - i * 18 - drift * .12, 36 + i * 10);
      }
    }
  }

  function updateBreathTimeline() {
    if (!breathRunning) {
      if (breathPhase === "done") {
        breathProgress = 0;
        breathMood = 1;
        breathColor = "#00a95c";
      } else {
        breathProgress = 0;
        breathMood = 0;
        breathColor = "#ef3340";
      }
      return;
    }

    const inhaleMs = 4000;
    const holdMs = 7000;
    const exhaleMs = 8000;
    const totalMs = inhaleMs + holdMs + exhaleMs;
    const elapsed = performance.now() - breathStartAt;

    if (elapsed >= totalMs) {
      breathRunning = false;
      breathButton.textContent = "Fazer de novo";
      setBreathState("done", "✓", "Muito bem. O dragão ficou verde e alegre.");
      breathProgress = 0;
      breathMood = 1;
      breathColor = "#00a95c";
      return;
    }

    if (elapsed < inhaleMs) {
      const t = p.constrain(elapsed / inhaleMs, 0, 1);
      breathProgress = t;
      breathMood = t * .45;
      breathColor = p.lerpColor(p.color("#ef3340"), p.color("#b779ff"), t).toString();
      setBreathState("inhale", Math.max(1, Math.ceil((inhaleMs - elapsed) / 1000)), "Inspira: o dragão bravo vai ficando lilás.");
      return;
    }

    if (elapsed < inhaleMs + holdMs) {
      const phaseElapsed = elapsed - inhaleMs;
      breathProgress = 1;
      breathMood = .45;
      breathColor = "#b779ff";
      setBreathState("hold", Math.max(1, Math.ceil((holdMs - phaseElapsed) / 1000)), "Segura: ele guarda o fogo com cuidado.");
      return;
    }

    const phaseElapsed = elapsed - inhaleMs - holdMs;
    const t = p.constrain(phaseElapsed / exhaleMs, 0, 1);
    breathProgress = 1 - t;
    breathMood = .45 + t * .55;
    breathColor = p.lerpColor(p.color("#b779ff"), p.color("#00a95c"), t).toString();
    setBreathState("exhale", Math.max(1, Math.ceil((exhaleMs - phaseElapsed) / 1000)), "Solta devagar: ele fica verde e alegre.");
  }

  function drawDragon(x, y, size, color, breath, intense, mood = intense ? 0 : 1) {
    p.push();
    p.translate(x, y);
    const s = size / 420;
    p.scale(s);
    p.noStroke();
    p.fill(0, 0, 0, 45);
    p.ellipse(-10, 130, 360, 64);
    p.stroke("#162033");
    p.strokeWeight(8);
    p.fill(color);
    p.ellipse(-35, 20, 330 + breath * 54, 185 + breath * 42);
    p.fill("#fff3a6");
    p.ellipse(-36, 22, 90 + breath * 35, 74 + breath * 28);
    p.fill(color);
    p.ellipse(145, -22, 122, 98);
    p.rect(-260, 10, 145, 64, 42);
    p.fill("#ffd400");
    p.triangle(-68, -76, 12, -190, 92, -70);
    p.fill("#162033");
    p.noStroke();
    p.circle(128, -35, 10);
    p.circle(170, -35, 10);
    p.noFill();
    p.stroke("#162033");
    p.strokeWeight(5);
    if (mood < .35) {
      p.line(130, -12, 170, -12);
    } else {
      p.arc(150, -20, 42, 26 + mood * 16, 0, p.PI);
    }
    if (intense || mood < .35) {
      p.stroke("#162033");
      p.strokeWeight(7);
      p.line(108, -66, 136, -54);
      p.line(194, -66, 166, -54);
    }
    p.pop();
  }

  function drawSpark(x, y, r) {
    p.push();
    p.translate(x, y);
    p.rotate(p.frameCount * .02);
    p.noStroke();
    p.fill("#ffd400bb");
    p.beginShape();
    for (let i = 0; i < 10; i += 1) {
      const angle = p.TWO_PI * i / 10;
      const radius = i % 2 === 0 ? r : r * .38;
      p.vertex(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    p.endShape(p.CLOSE);
    p.pop();
  }

  function drawToolIcons() {
    const mobile = p.width < 700;
    if (mobile) return;
    const x = p.width * .78;
    const y = p.height * .61;
    const card = 126;
    const gap = 150;
    const items = [["respirar", "#0057ff"], ["nomear", "#ffd400"], ["ajuda", "#00a95c"]];
    items.forEach(([text, color], i) => {
      const px = x + (i - 1) * gap;
      p.noStroke();
      p.fill(0, 0, 0, 40);
      p.rect(px - card / 2, y - card / 2 + 12, card, card, 28);
      p.fill(color);
      p.rect(px - card / 2, y - card / 2, card, card, 28);
      p.fill(color === "#ffd400" ? "#162033" : "#fff");
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(20);
      p.text(text, px, y + 10);
    });
  }

  function drawMedal() {
    const x = p.width * .76;
    const y = p.height * .42;
    p.noStroke();
    p.fill("#ef3340");
    p.quad(x - 70, y - 120, x - 10, y - 120, x + 36, y + 80, x - 28, y + 80);
    p.fill("#0057ff");
    p.quad(x + 10, y - 120, x + 70, y - 120, x + 28, y + 80, x - 36, y + 80);
    p.stroke("#162033");
    p.strokeWeight(7);
    p.fill("#ffd400");
    p.circle(x, y + 80, 190);
    p.noStroke();
    p.fill("#162033");
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(34);
    p.text("MISSÃO", x, y + 62);
    p.textSize(24);
    p.text("CUMPRIDA", x, y + 96);
  }
});
