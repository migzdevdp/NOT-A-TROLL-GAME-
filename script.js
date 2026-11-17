const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const victoryModal = document.getElementById("victory-modal");
const stageSelectModal = document.getElementById("stage-select-modal");
const stageGrid = document.getElementById("stage-grid");
const customizeModal = document.getElementById("customize-modal");

const playBtn = document.getElementById("play-btn");
const replayBtn = document.getElementById("replay-btn");
const stagesBtn = document.getElementById("stages-btn");
const customizeBtn = document.getElementById("customize-btn");
const saveCustomBtn = document.getElementById("save-custom-btn");
const hudStagesBtn = document.getElementById("hud-stages-btn");
const winStagesBtn = document.getElementById("win-stages-btn");
const closeStagesBtn = document.getElementById("close-stages-btn");
const menuBtn = document.getElementById("menu-btn");
const resetBtn = document.getElementById("reset-btn");

const lvlDisplay = document.getElementById("lvl-display");
const deathDisplay = document.getElementById("death-display");
const finalDeathsDisplay = document.getElementById("final-deaths");
const activeCharBadge = document.getElementById("active-char-badge");
const hudCharDisplay = document.getElementById("hud-char-display");

const previewCanvas = document.getElementById("preview-canvas");
const pCtx = previewCanvas.getContext("2d");
const selectedCharNameEl = document.getElementById("selected-char-name");
const presetListEl = document.getElementById("preset-list");
const colorListEl = document.getElementById("color-list");
const eyeListEl = document.getElementById("eye-list");
const hatListEl = document.getElementById("hat-list");

const CHARACTER_PRESETS = [
  { id: "miguel", name: "Miguel", isDev: true, body: "#1c0d08", eye: "#ffd700", hat: "crown" },
  { id: "karra", name: "Karra", isDev: false, body: "#7a1c4b", eye: "#ffb6c1", hat: "headband" },
  { id: "oscar", name: "Oscar", isDev: false, body: "#1b3b6f", eye: "#7dd3fc", hat: "cap" },
  { id: "macha", name: "Macha", isDev: false, body: "#2d5a27", eye: "#bef264", hat: "glasses" },
  { id: "jhanster", name: "Jhanster", isDev: false, body: "#8c2d19", eye: "#fde047", hat: "horns" },
  { id: "yana", name: "Yana", isDev: false, body: "#4c1d95", eye: "#f0abfc", hat: "headband" },
  { id: "kael", name: "Kael", isDev: false, body: "#0f4c5c", eye: "#ffffff", hat: "cap" },
  { id: "zia", name: "Zia", isDev: false, body: "#9a3412", eye: "#fed7aa", hat: "glasses" },
  { id: "brix", name: "Brix", isDev: false, body: "#27272a", eye: "#ef4444", hat: "horns" },
  { id: "tala", name: "Tala", isDev: false, body: "#78350f", eye: "#fef08a", hat: "none" }
];

const BODY_COLORS = [
  "#1c0d08", "#7a1c4b", "#1b3b6f", "#2d5a27", "#8c2d19",
  "#4c1d95", "#0f4c5c", "#9a3412", "#27272a", "#b32419"
];

const EYE_COLORS = [
  "#f3a86b", "#ffd700", "#ffffff", "#7dd3fc",
  "#bef264", "#ffb6c1", "#ef4444", "#f0abfc"
];

const HAT_OPTIONS = [
  { id: "none", label: "None" },
  { id: "crown", label: "Dev Crown" },
  { id: "cap", label: "Cap" },
  { id: "headband", label: "Headband" },
  { id: "glasses", label: "Glasses" },
  { id: "horns", label: "Horns" }
];

let savedCustom = null;
try {
  savedCustom = JSON.parse(localStorage.getItem("ntg_character_custom"));
} catch (e) {
  savedCustom = null;
}

let currentChar = savedCustom || {
  id: "miguel",
  name: "Miguel",
  isDev: true,
  body: "#1c0d08",
  eye: "#ffd700",
  hat: "crown"
};

function getFormattedCharLabel(charObj) {
  return charObj.isDev
    ? `${charObj.name.toUpperCase()} [DEV]`
    : charObj.name.toUpperCase();
}

function saveCharacterCustom() {
  localStorage.setItem("ntg_character_custom", JSON.stringify(currentChar));
  updateCharacterBadges();
}

function updateCharacterBadges() {
  const label = getFormattedCharLabel(currentChar);
  if (activeCharBadge) {
    activeCharBadge.innerText = `PLAYER: ${label}`;
    activeCharBadge.style.borderColor = currentChar.isDev ? "#b32419" : "#26120b";
    activeCharBadge.style.color = currentChar.isDev ? "#ffd700" : "#f3a86b";
  }
  if (hudCharDisplay) {
    hudCharDisplay.innerText = label;
    if (currentChar.isDev) {
      hudCharDisplay.classList.add("dev-hud");
    } else {
      hudCharDisplay.classList.remove("dev-hud");
    }
  }
}

function renderCharacterSprite(targetCtx, x, y, w, h, facing, gravDir, isMoving, frameCount, styleObj) {
  targetCtx.fillStyle = styleObj.body;
  targetCtx.fillRect(x + 4, y, w - 8, h - 8);

  targetCtx.fillStyle = styleObj.eye;
  const eyeX = facing === 1 ? x + w - 13 : x + 7;
  const eyeY = gravDir > 0 ? y + 7 : y + h - 18;
  targetCtx.fillRect(eyeX, eyeY, 4, 4);

  if (styleObj.hat === "glasses") {
    targetCtx.fillStyle = "#111111";
    const glassY = gravDir > 0 ? y + 6 : y + h - 19;
    targetCtx.fillRect(x + 5, glassY, w - 10, 6);
    targetCtx.fillStyle = styleObj.eye;
    targetCtx.fillRect(eyeX, glassY + 1, 4, 4);
  } else if (styleObj.hat === "headband") {
    targetCtx.fillStyle = "#d93829";
    const bandY = gravDir > 0 ? y + 3 : y + h - 14;
    targetCtx.fillRect(x + 4, bandY, w - 8, 4);
  } else if (styleObj.hat === "cap") {
    targetCtx.fillStyle = "#26120b";
    if (gravDir > 0) {
      targetCtx.fillRect(x + 3, y - 4, w - 6, 5);
      const brimX = facing === 1 ? x + w - 8 : x - 2;
      targetCtx.fillRect(brimX, y - 1, 10, 3);
    } else {
      targetCtx.fillRect(x + 3, y + h - 9, w - 6, 5);
      const brimX = facing === 1 ? x + w - 8 : x - 2;
      targetCtx.fillRect(brimX, y + h - 11, 10, 3);
    }
  } else if (styleObj.hat === "crown") {
    targetCtx.fillStyle = "#ffd700";
    if (gravDir > 0) {
      targetCtx.fillRect(x + 5, y - 5, w - 10, 5);
      targetCtx.fillRect(x + 5, y - 8, 3, 3);
      targetCtx.fillRect(x + w / 2 - 1.5, y - 9, 3, 4);
      targetCtx.fillRect(x + w - 8, y - 8, 3, 3);
    } else {
      targetCtx.fillRect(x + 5, y + h - 8, w - 10, 5);
      targetCtx.fillRect(x + 5, y + h - 3, 3, 3);
      targetCtx.fillRect(x + w / 2 - 1.5, y + h - 3, 3, 4);
      targetCtx.fillRect(x + w - 8, y + h - 3, 3, 3);
    }
  } else if (styleObj.hat === "horns") {
    targetCtx.fillStyle = "#b32419";
    if (gravDir > 0) {
      targetCtx.fillRect(x + 5, y - 6, 4, 6);
      targetCtx.fillRect(x + w - 9, y - 6, 4, 6);
    } else {
      targetCtx.fillRect(x + 5, y + h - 8, 4, 6);
      targetCtx.fillRect(x + w - 9, y + h - 8, 4, 6);
    }
  }

  targetCtx.fillStyle = styleObj.body;
  const legOffset = isMoving ? Math.sin(frameCount * 0.45) * 5 : 0;
  if (gravDir > 0) {
    targetCtx.fillRect(x + 6, y + h - 8 + legOffset, 5, 8);
    targetCtx.fillRect(x + w - 11, y + h - 8 - legOffset, 5, 8);
  } else {
    targetCtx.fillRect(x + 6, y - legOffset, 5, 8);
    targetCtx.fillRect(x + w - 11, y + legOffset, 5, 8);
  }
}

function drawPreviewCharacter() {
  if (!pCtx) return;
  pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  pCtx.fillStyle = "#3b2016";
  pCtx.fillRect(0, 88, previewCanvas.width, 22);

  pCtx.save();
  pCtx.translate(27, 16);
  pCtx.scale(2, 2);
  renderCharacterSprite(pCtx, 0, 0, 28, 36, 1, 1, false, 0, currentChar);
  pCtx.restore();

  selectedCharNameEl.innerText = getFormattedCharLabel(currentChar);
  if (currentChar.isDev) {
    selectedCharNameEl.classList.add("is-dev");
  } else {
    selectedCharNameEl.classList.remove("is-dev");
  }
}

function renderCustomizeUI() {
  presetListEl.innerHTML = "";
  CHARACTER_PRESETS.forEach((preset) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    if (preset.isDev) btn.classList.add("dev-opt");
    if (currentChar.id === preset.id) btn.classList.add("selected");
    btn.innerText = preset.isDev ? `${preset.name} [DEV]` : preset.name;
    btn.addEventListener("click", () => {
      playSound(480, 0.06);
      currentChar = { ...preset };
      renderCustomizeUI();
      drawPreviewCharacter();
    });
    presetListEl.appendChild(btn);
  });

  colorListEl.innerHTML = "";
  BODY_COLORS.forEach((hex) => {
    const sw = document.createElement("button");
    sw.className = "swatch-btn";
    sw.style.backgroundColor = hex;
    if (currentChar.body === hex) sw.classList.add("selected");
    sw.addEventListener("click", () => {
      playSound(520, 0.05);
      currentChar.body = hex;
      renderCustomizeUI();
      drawPreviewCharacter();
    });
    colorListEl.appendChild(sw);
  });

  eyeListEl.innerHTML = "";
  EYE_COLORS.forEach((hex) => {
    const sw = document.createElement("button");
    sw.className = "swatch-btn";
    sw.style.backgroundColor = hex;
    if (currentChar.eye === hex) sw.classList.add("selected");
    sw.addEventListener("click", () => {
      playSound(560, 0.05);
      currentChar.eye = hex;
      renderCustomizeUI();
      drawPreviewCharacter();
    });
    eyeListEl.appendChild(sw);
  });

  hatListEl.innerHTML = "";
  HAT_OPTIONS.forEach((hat) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    if (currentChar.hat === hat.id) btn.classList.add("selected");
    btn.innerText = hat.label;
    btn.addEventListener("click", () => {
      playSound(600, 0.05);
      currentChar.hat = hat.id;
      renderCustomizeUI();
      drawPreviewCharacter();
    });
    hatListEl.appendChild(btn);
  });

  drawPreviewCharacter();
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, duration, type = "square") {
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playWinSound() {
  playSound(523.25, 0.12, "square");
  setTimeout(() => playSound(659.25, 0.12, "square"), 110);
  setTimeout(() => playSound(783.99, 0.25, "square"), 220);
}

let currentStage = 1;
let maxUnlockedStage = parseInt(localStorage.getItem("ntg_unlocked_stage")) || 1;
let deaths = 0;
let gameRunning = false;
let animFrame = 0;
let stageClearing = false;
let doorOpenProgress = 0;

let isDying = false;
let deathTimer = 0;
let shakeTime = 0;
let shakeIntensity = 0;
let deathParticles = [];

const input = { left: false, right: false, jump: false };

const player = {
  x: 60, y: 280, w: 28, h: 36,
  vx: 0, vy: 0,
  speed: 5.2,
  jumpForce: -11.5,
  gravity: 0.55,
  grounded: false,
  facing: 1
};

let platforms = [];
let spikes = [];
let doors = [];
let saws = [];
let trapState = {};

function saveUnlockedStage(stageNum) {
  if (stageNum > maxUnlockedStage) {
    maxUnlockedStage = Math.min(40, stageNum);
    localStorage.setItem("ntg_unlocked_stage", maxUnlockedStage);
  }
}

function renderStageGrid() {
  stageGrid.innerHTML = "";
  for (let i = 1; i <= 40; i++) {
    const btn = document.createElement("button");
    btn.className = "stage-tile";
    if (i <= maxUnlockedStage) {
      btn.innerText = i;
      if (i < maxUnlockedStage) {
        btn.classList.add("cleared");
      } else {
        btn.classList.add("current-unlocked");
      }
      btn.addEventListener("click", () => {
        stageSelectModal.classList.add("hidden");
        startAtStage(i);
      });
    } else {
      btn.innerText = "🔒";
      btn.disabled = true;
    }
    stageGrid.appendChild(btn);
  }
}

function openStageSelect() {
  playSound(450, 0.08);
  input.left = false;
  input.right = false;
  input.jump = false;
  renderStageGrid();
  stageSelectModal.classList.remove("hidden");
}

function startAtStage(stageNumber) {
  playSound(500, 0.15);
  titleScreen.classList.add("hidden");
  victoryModal.classList.add("hidden");
  stageSelectModal.classList.add("hidden");
  customizeModal.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  input.left = false;
  input.right = false;
  input.jump = false;
  currentStage = stageNumber;
  deaths = 0;
  stageClearing = false;
  isDying = false;
  deathParticles = [];
  updateCharacterBadges();
  updateHUD();
  loadStage(currentStage);
  if (!gameRunning) {
    gameRunning = true;
    gameLoop();
  }
}

function startNewRun() {
  startAtStage(1);
}

playBtn.addEventListener("click", startNewRun);
replayBtn.addEventListener("click", startNewRun);
stagesBtn.addEventListener("click", openStageSelect);
hudStagesBtn.addEventListener("click", openStageSelect);
winStagesBtn.addEventListener("click", openStageSelect);

customizeBtn.addEventListener("click", () => {
  playSound(480, 0.08);
  renderCustomizeUI();
  customizeModal.classList.remove("hidden");
});

saveCustomBtn.addEventListener("click", () => {
  playSound(620, 0.1);
  saveCharacterCustom();
  customizeModal.classList.add("hidden");
});

closeStagesBtn.addEventListener("click", () => {
  playSound(350, 0.08);
  stageSelectModal.classList.add("hidden");
});

menuBtn.addEventListener("click", () => {
  input.left = false;
  input.right = false;
  input.jump = false;
  gameScreen.classList.add("hidden");
  victoryModal.classList.add("hidden");
  stageSelectModal.classList.add("hidden");
  customizeModal.classList.add("hidden");
  titleScreen.classList.remove("hidden");
});

resetBtn.addEventListener("click", () => {
  if (!stageClearing && !isDying) {
    die();
  }
});

function updateHUD() {
  lvlDisplay.innerText = currentStage;
  deathDisplay.innerText = deaths;
}

function spawnDeathParticles() {
  deathParticles = [];
  const colors = [currentChar.body, currentChar.body, "#b32419", "#d93829", currentChar.eye];
  const centerX = player.x + player.w / 2;
  const centerY = player.y + player.h / 2;

  for (let i = 0; i < 28; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6.5;
    deathParticles.push({
      x: centerX + (Math.random() - 0.5) * player.w,
      y: centerY + (Math.random() - 0.5) * player.h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rot: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.3
    });
  }
}

function die() {
  if (stageClearing || isDying) return;
  isDying = true;
  deathTimer = 28;
  shakeTime = 16;
  shakeIntensity = 9;
  deaths++;
  updateHUD();
  playSound(140, 0.25, "sawtooth");
  spawnDeathParticles();
}

function nextStage() {
  if (stageClearing || isDying) return;
  stageClearing = true;
  doorOpenProgress = 0;
  player.vx = 0;
  player.vy = 0;
  playWinSound();

  if (currentStage < 40) {
    saveUnlockedStage(currentStage + 1);
  } else {
    saveUnlockedStage(40);
  }

  setTimeout(() => {
    stageClearing = false;
    if (currentStage < 40) {
      currentStage++;
      updateHUD();
      loadStage(currentStage);
    } else {
      finalDeathsDisplay.innerText = deaths;
      victoryModal.classList.remove("hidden");
    }
  }, 750);
}

function loadStage(stage) {
  player.x = 60;
  player.y = 260;
  player.w = 28;
  player.h = 36;
  player.vx = 0;
  player.vy = 0;
  player.gravity = 0.55;
  player.jumpForce = -11.5;
  player.grounded = false;

  isDying = false;
  deathParticles = [];
  platforms = [];
  spikes = [];
  doors = [];
  saws = [];
  trapState = { triggered: false, reversed: false, gravFlipped: false, lightsOut: false, fakeWin: false, teleCount: 0, shrunk: false };

  const dpad = document.querySelector(".dpad");
  if (dpad) dpad.style.flexDirection = "row";

  platforms.push({ x: 0, y: 0, w: 800, h: 30, solid: true });

  switch (stage) {
    case 1:
      platforms.push({ id: "p1", x: 0, y: 320, w: 380, h: 80, solid: true });
      platforms.push({ id: "p2", x: 380, y: 320, w: 420, h: 80, solid: true });
      doors.push({ x: 700, y: 265, w: 36, h: 55, real: true });
      break;
    case 2:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      spikes.push({ id: "s1", x: 340, y: 300, w: 30, h: 20, dir: "up" });
      doors.push({ x: 700, y: 265, w: 36, h: 55, real: true });
      break;
    case 3:
      platforms.push({ x: 0, y: 320, w: 280, h: 80, solid: true });
      platforms.push({ x: 360, y: 320, w: 440, h: 80, solid: true });
      doors.push({ id: "d1", x: 680, y: 265, w: 36, h: 55, real: true });
      break;
    case 4:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ id: "ceil", x: 280, y: 30, w: 180, h: 60, solid: true, deadly: false });
      doors.push({ x: 700, y: 265, w: 36, h: 55, real: true });
      break;
    case 5:
      platforms.push({ x: 0, y: 320, w: 180, h: 80, solid: true });
      platforms.push({ id: "fake1", x: 240, y: 290, w: 110, h: 25, solid: true });
      platforms.push({ id: "fake2", x: 420, y: 260, w: 110, h: 25, solid: true });
      platforms.push({ x: 600, y: 320, w: 200, h: 80, solid: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 6:
      platforms.push({ x: 0, y: 320, w: 330, h: 80, solid: true });
      platforms.push({ x: 420, y: 320, w: 380, h: 80, solid: true });
      spikes.push({ x: 540, y: 300, w: 30, h: 20, dir: "up" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 7:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      saws.push({ id: "saw1", x: 450, y: 315, r: 24, angle: 0 });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 8:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ x: 20, y: 215, w: 130, h: 25, solid: true });
      doors.push({ id: "fakedoor", x: 680, y: 265, w: 36, h: 55, real: false });
      doors.push({ id: "realdoor", x: 45, y: 160, w: 36, h: 55, real: true });
      break;
    case 9:
      platforms.push({ x: 0, y: 320, w: 350, h: 80, solid: true });
      platforms.push({ x: 450, y: 320, w: 350, h: 80, solid: true });
      spikes.push({ x: 550, y: 30, w: 40, h: 20, dir: "down" });
      doors.push({ x: 710, y: 30, w: 36, h: 55, real: true });
      break;
    case 10:
      platforms.push({ id: "p10_1", x: 0, y: 320, w: 260, h: 80, solid: true });
      platforms.push({ id: "p10_2", x: 330, y: 320, w: 470, h: 80, solid: true });
      spikes.push({ id: "s10", x: 480, y: 320, w: 30, h: 20, dir: "up" });
      doors.push({ id: "d10", x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 11:
      platforms.push({ id: "p11", x: 0, y: 320, w: 800, h: 80, solid: true });
      doors.push({ id: "d11", x: 690, y: 265, w: 36, h: 55, real: true });
      break;
    case 12:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      spikes.push({ id: "s12_a", x: 520, y: 300, w: 30, h: 20, dir: "up" });
      spikes.push({ id: "s12_b", x: 10, y: 300, w: 30, h: 20, dir: "up" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 13:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      spikes.push({ x: 320, y: 300, w: 40, h: 20, dir: "up" });
      spikes.push({ id: "s13_top", x: 300, y: 30, w: 120, h: 25, dir: "down" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 14:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ x: 330, y: 215, w: 140, h: 25, solid: true });
      doors.push({ id: "d14_fake", x: 380, y: 160, w: 36, h: 55, real: false });
      doors.push({ id: "d14_real", x: 690, y: 265, w: 36, h: 55, real: true });
      break;
    case 15:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ x: 480, y: 30, w: 90, h: 245, solid: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 16:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ id: "wall16", x: 600, y: 320, w: 35, h: 95, solid: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 17:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      saws.push({ id: "saw17_l", x: 10, y: 315, r: 22, angle: 0 });
      saws.push({ id: "saw17_r", x: 790, y: 315, r: 22, angle: 0 });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 18:
      platforms.push({ id: "p18_a", x: 0, y: 320, w: 280, h: 80, solid: true });
      platforms.push({ id: "p18_b", x: 370, y: 320, w: 180, h: 80, solid: true });
      platforms.push({ id: "p18_c", x: 630, y: 320, w: 170, h: 80, solid: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 19:
      platforms.push({ x: 0, y: 320, w: 320, h: 80, solid: true });
      platforms.push({ x: 430, y: 320, w: 370, h: 80, solid: true });
      spikes.push({ x: 520, y: 30, w: 40, h: 20, dir: "down" });
      doors.push({ x: 710, y: 30, w: 36, h: 55, real: true });
      break;
    case 20:
      platforms.push({ id: "p20_1", x: 0, y: 320, w: 250, h: 80, solid: true });
      platforms.push({ id: "p20_2", x: 320, y: 320, w: 480, h: 80, solid: true });
      platforms.push({ id: "ceil20", x: 380, y: 30, w: 120, h: 50, solid: true, deadly: false });
      spikes.push({ id: "s20", x: 560, y: 320, w: 30, h: 20, dir: "up" });
      doors.push({ id: "d20", x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 21:
      platforms.push({ x: 0, y: 320, w: 220, h: 80, solid: true });
      platforms.push({ id: "inv21", x: 250, y: 320, w: 280, h: 80, solid: true, invisible: true });
      platforms.push({ id: "end21", x: 560, y: 320, w: 240, h: 80, solid: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 22:
      platforms.push({ x: 0, y: 320, w: 340, h: 80, solid: true });
      platforms.push({ x: 430, y: 320, w: 370, h: 80, solid: true });
      spikes.push({ x: 550, y: 300, w: 30, h: 20, dir: "up" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 23:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      spikes.push({ x: 280, y: 300, w: 35, h: 20, dir: "up" });
      spikes.push({ x: 510, y: 300, w: 35, h: 20, dir: "up" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 24:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ id: "bounce24", x: 340, y: 305, w: 90, h: 15, solid: true });
      spikes.push({ x: 280, y: 30, w: 220, h: 25, dir: "down" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 25:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ id: "ceil25", x: 540, y: 30, w: 140, h: 60, solid: true, deadly: false });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 26:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ id: "wall26_l", x: 0, y: 30, w: 20, h: 290, solid: true });
      platforms.push({ id: "wall26_r", x: 780, y: 30, w: 20, h: 290, solid: true });
      spikes.push({ x: 380, y: 300, w: 35, h: 20, dir: "up" });
      doors.push({ x: 690, y: 265, w: 36, h: 55, real: true });
      break;
    case 27:
      platforms.push({ x: 0, y: 320, w: 260, h: 80, solid: true });
      platforms.push({ x: 520, y: 320, w: 280, h: 80, solid: true });
      spikes.push({ x: 360, y: 30, w: 80, h: 20, dir: "down" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 28:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ x: 330, y: 215, w: 140, h: 25, solid: true });
      doors.push({ id: "d28", x: 700, y: 265, w: 36, h: 55, real: true });
      break;
    case 29:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      saws.push({ id: "saw29_1", x: 250, y: -30, r: 22, angle: 0 });
      saws.push({ id: "saw29_2", x: 430, y: -30, r: 22, angle: 0 });
      saws.push({ id: "saw29_3", x: 600, y: -30, r: 22, angle: 0 });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 30:
      platforms.push({ x: 0, y: 320, w: 320, h: 80, solid: true });
      platforms.push({ x: 410, y: 320, w: 390, h: 80, solid: true });
      spikes.push({ x: 520, y: 300, w: 30, h: 20, dir: "up" });
      doors.push({ id: "d30", x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 31:
      platforms.push({ x: 0, y: 320, w: 200, h: 80, solid: true });
      platforms.push({ x: 245, y: 295, w: 95, h: 25, solid: false });
      platforms.push({ x: 375, y: 285, w: 120, h: 25, solid: true });
      platforms.push({ x: 575, y: 320, w: 225, h: 80, solid: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 32:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      spikes.push({ id: "s32_1", x: 240, y: 325, w: 35, h: 20, dir: "up" });
      spikes.push({ id: "s32_2", x: 360, y: 325, w: 35, h: 20, dir: "up" });
      spikes.push({ id: "s32_3", x: 480, y: 325, w: 35, h: 20, dir: "up" });
      spikes.push({ id: "s32_4", x: 600, y: 325, w: 35, h: 20, dir: "up" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 33:
      platforms.push({ x: 0, y: 320, w: 290, h: 80, solid: true });
      platforms.push({ x: 410, y: 320, w: 390, h: 80, solid: true });
      spikes.push({ x: 540, y: 300, w: 35, h: 20, dir: "up" });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 34:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ id: "p34_step", x: 430, y: 225, w: 110, h: 20, solid: false, invisible: true });
      platforms.push({ id: "p34_high", x: 590, y: 150, w: 180, h: 25, solid: true });
      spikes.push({ id: "s34_trap", x: 260, y: 325, w: 60, h: 20, dir: "up" });
      doors.push({ id: "d34", x: 270, y: 265, w: 36, h: 55, real: true });
      break;
    case 35:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ id: "step35", x: 230, y: 230, w: 110, h: 20, solid: false, invisible: true });
      platforms.push({ id: "plat35_top", x: 350, y: 210, w: 100, h: 20, solid: false, invisible: true });
      spikes.push({ x: 375, y: 300, w: 35, h: 20, dir: "up" });
      doors.push({ id: "d35_fake", x: 700, y: 265, w: 36, h: 55, real: false });
      doors.push({ id: "d35_real", x: -100, y: 155, w: 36, h: 55, real: true });
      break;
    case 36:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      saws.push({ id: "saw36", x: 640, y: 315, r: 24, angle: 0 });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 37:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ x: 530, y: 30, w: 50, h: 245, solid: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 38:
      platforms.push({ x: 0, y: 320, w: 800, h: 80, solid: true });
      platforms.push({ x: 270, y: 255, w: 25, h: 65, solid: true, invisible: true });
      platforms.push({ x: 490, y: 245, w: 25, h: 75, solid: true, invisible: true });
      doors.push({ x: 710, y: 265, w: 36, h: 55, real: true });
      break;
    case 39:
      platforms.push({ id: "p39_l", x: 0, y: 320, w: 340, h: 80, solid: true });
      platforms.push({ x: 460, y: 320, w: 340, h: 80, solid: true });
      saws.push({ id: "saw39", x: 560, y: -30, r: 24, angle: 0 });
      doors.push({ x: 710, y: 30, w: 36, h: 55, real: true });
      break;
    case 40:
      platforms.push({ x: 0, y: 320, w: 310, h: 80, solid: true });
      platforms.push({ x: 400, y: 320, w: 400, h: 80, solid: true });
      spikes.push({ x: 500, y: 300, w: 30, h: 20, dir: "up" });
      doors.push({ id: "d40", x: 710, y: 265, w: 36, h: 55, real: true });
      break;
  }
}
function updateTraps() {
  switch (currentStage) {
    case 1:
      if (player.x > 260) trapState.triggered = true;
      if (trapState.triggered) {
        let p1 = platforms.find(p => p.id === "p1");
        let p2 = platforms.find(p => p.id === "p2");
        if (p1 && p1.w > 290) p1.w -= 6;
        if (p2 && p2.x < 470) { p2.x += 6; p2.w -= 6; }
      }
      break;
    case 2:
      if (player.x > 220) trapState.triggered = true;
      if (trapState.triggered) {
        let s1 = spikes.find(s => s.id === "s1");
        if (s1 && s1.x < 430) s1.x += 5.5;
      }
      break;
    case 3:
      if (player.x > 560 && !trapState.triggered) { trapState.triggered = true; playSound(450, 0.1); }
      if (trapState.triggered) {
        let d1 = doors.find(d => d.id === "d1");
        if (d1 && d1.x > 120) d1.x -= 9;
      }
      break;
    case 4:
      if (player.x > 210) trapState.triggered = true;
      if (trapState.triggered) {
        let ceil = platforms.find(p => p.id === "ceil");
        if (ceil && ceil.y < 260) { ceil.y += 10; if (rectIntersect(player, ceil)) die(); }
      }
      break;
    case 5:
      let f1 = platforms.find(p => p.id === "fake1");
      let f2 = platforms.find(p => p.id === "fake2");
      if (player.x > 220 && f1) f1.y += 8;
      if (player.x > 400 && f2) f2.y += 8;
      break;
    case 6:
      if (player.x > 260 && !trapState.reversed) { trapState.reversed = true; playSound(250, 0.2); }
      break;
    case 7:
      let saw = saws.find(s => s.id === "saw1");
      if (saw) {
        saw.angle += 0.25;
        if (player.x > 300) trapState.triggered = true;
        if (trapState.triggered && saw.x > 150) saw.x -= 6.5;
      }
      break;
    case 8:
      let fakeD = doors.find(d => d.id === "fakedoor");
      if (player.x > 580 && fakeD) { fakeD.x = -100; playSound(200, 0.2); }
      break;
    case 9:
      if (player.x > 280 && !trapState.gravFlipped) {
        trapState.gravFlipped = true; player.gravity = -0.55; player.jumpForce = 11.5; playSound(550, 0.2);
      }
      break;
    case 10:
      let p10_2 = platforms.find(p => p.id === "p10_2");
      let s10 = spikes.find(s => s.id === "s10");
      let d10 = doors.find(d => d.id === "d10");
      if (player.x > 200 && p10_2 && p10_2.x < 390) { p10_2.x += 5; p10_2.w -= 5; }
      if (player.x > 410 && s10 && s10.y > 300) s10.y -= 5;
      if (player.x > 610 && d10 && d10.x > 550) d10.x -= 8;
      break;
    case 11:
      let p11 = platforms.find(p => p.id === "p11");
      if (player.x > 320 && p11 && p11.w > 480) p11.w -= 8;
      break;
    case 12:
      let s12a = spikes.find(s => s.id === "s12_a");
      let s12b = spikes.find(s => s.id === "s12_b");
      if (player.x > 240) trapState.triggered = true;
      if (trapState.triggered) {
        if (s12a && s12a.x > 310) s12a.x -= 6;
        if (s12b && s12b.x < 250) s12b.x += 5;
      }
      break;
    case 13:
      let s13 = spikes.find(s => s.id === "s13_top");
      if (player.x > 260 && !player.grounded && s13 && s13.y < 135) s13.y += 12;
      break;
    case 14:
      let d14f = doors.find(d => d.id === "d14_fake");
      let d14r = doors.find(d => d.id === "d14_real");
      if (player.x > 580 && !trapState.triggered) {
        trapState.triggered = true; playSound(450, 0.15);
        d14r.x = 380; d14r.y = 160; d14f.x = 690; d14f.y = 265;
      }
      break;
    case 15:
      if (player.x > 250 && player.x < 350 && player.grounded && !trapState.triggered) {
        trapState.triggered = true;
        player.w = 52;
        player.h = 68;
        player.y -= 32;
        playSound(220, 0.2);
        setTimeout(() => { if (currentStage === 15 && !isDying) die(); }, 1200);
      }
      break;
    case 16:
      let w16 = platforms.find(p => p.id === "wall16");
      if (player.x > 480 && w16 && w16.y > 225) w16.y -= 10;
      break;
    case 17:
      let sawL = saws.find(s => s.id === "saw17_l");
      let sawR = saws.find(s => s.id === "saw17_r");
      if (sawL && sawR) {
        sawL.angle += 0.25; sawR.angle -= 0.25;
        if (player.x > 200) trapState.triggered = true;
        if (trapState.triggered) {
          if (sawL.x < 360) sawL.x += 4.5;
          if (sawR.x > 440) sawR.x -= 4.5;
        }
      }
      break;
    case 18:
      if (player.x > 160 && !trapState.triggered) {
        trapState.triggered = true; playSound(300, 0.15);
        platforms.forEach(p => { if (p.id) p.invisible = true; });
      }
      break;
    case 19:
      if (player.x > 250 && !trapState.gravFlipped) {
        trapState.gravFlipped = true; trapState.reversed = true;
        player.gravity = -0.55; player.jumpForce = 11.5; playSound(550, 0.2);
      }
      break;
    case 20:
      let ceil20 = platforms.find(p => p.id === "ceil20");
      let s20 = spikes.find(s => s.id === "s20");
      let d20 = doors.find(d => d.id === "d20");
      if (player.x > 310 && ceil20 && ceil20.y < 270) { ceil20.y += 11; if (rectIntersect(player, ceil20)) die(); }
      if (player.x > 480 && s20 && s20.y > 300) s20.y -= 6;
      if (player.x > 620 && d20 && d20.x > 520) d20.x -= 9;
      break;
    case 21:
      let end21 = platforms.find(p => p.id === "end21");
      if (player.x > 520 && end21 && end21.x < 660) { end21.x += 7; end21.w -= 7; }
      break;
    case 22:
      if (player.x > 250 && !trapState.reversed) {
        trapState.reversed = true;
        playSound(250, 0.2);
        const dpad = document.querySelector(".dpad");
        if (dpad) dpad.style.flexDirection = "row-reverse";
      }
      break;
    case 23:
      if (player.x > 140) trapState.lightsOut = true;
      break;
    case 24:
      let b24 = platforms.find(p => p.id === "bounce24");
      if (b24 && rectIntersect(player, { x: b24.x, y: b24.y - 4, w: b24.w, h: 10 })) {
        player.vy = -19;
        playSound(600, 0.15);
      }
      break;
    case 25:
      let ceil25 = platforms.find(p => p.id === "ceil25");
      if (player.x > 480 && !trapState.triggered) {
        trapState.triggered = true;
        trapState.fakeWin = true;
        playWinSound();
        setTimeout(() => { trapState.fakeWin = false; }, 900);
      }
      if (trapState.triggered && ceil25 && ceil25.y < 260) {
        ceil25.y += 9;
        if (rectIntersect(player, ceil25)) die();
      }
      break;
    case 26:
      let w26L = platforms.find(p => p.id === "wall26_l");
      let w26R = platforms.find(p => p.id === "wall26_r");
      if (player.x > 150) trapState.triggered = true;
      if (trapState.triggered && w26L && w26R) {
        if (w26L.w < 220) w26L.w += 2.2;
        if (w26R.x > 730) { w26R.x -= 2.2; w26R.w += 2.2; }
      }
      break;
    case 27:
      if (player.x > 220 && !trapState.gravFlipped) {
        trapState.gravFlipped = true; player.gravity = -0.55; player.jumpForce = 11.5; playSound(550, 0.2);
      }
      if (player.x > 470 && trapState.gravFlipped) {
        trapState.gravFlipped = false; player.gravity = 0.55; player.jumpForce = -11.5; playSound(350, 0.2);
      }
      break;
    case 28:
      let d28 = doors.find(d => d.id === "d28");
      if (d28 && Math.hypot(player.x - d28.x, player.y - d28.y) < 75 && trapState.teleCount < 3) {
        trapState.teleCount++;
        playSound(500, 0.1);
        if (trapState.teleCount === 1) { d28.x = 380; d28.y = 160; }
        else if (trapState.teleCount === 2) { d28.x = 80; d28.y = 265; }
        else if (trapState.teleCount === 3) { d28.x = 700; d28.y = 265; }
      }
      break;
    case 29:
      let s29_1 = saws.find(s => s.id === "saw29_1");
      let s29_2 = saws.find(s => s.id === "saw29_2");
      let s29_3 = saws.find(s => s.id === "saw29_3");
      if (player.x > 160 && s29_1 && s29_1.y < 315) { s29_1.y += 9; s29_1.angle += 0.2; }
      if (player.x > 340 && s29_2 && s29_2.y < 315) { s29_2.y += 10; s29_2.angle += 0.2; }
      if (player.x > 510 && s29_3 && s29_3.y < 315) { s29_3.y += 11; s29_3.angle += 0.2; }
      break;
    case 30:
      let d30 = doors.find(d => d.id === "d30");
      if (player.x > 220 && !trapState.reversed) {
        trapState.reversed = true; trapState.lightsOut = true; playSound(250, 0.2);
      }
      if (player.x > 610 && d30 && d30.x > 480) d30.x -= 8;
      break;
    case 31:
      break;
    case 32:
      let s32_1 = spikes.find(s => s.id === "s32_1");
      let s32_2 = spikes.find(s => s.id === "s32_2");
      let s32_3 = spikes.find(s => s.id === "s32_3");
      let s32_4 = spikes.find(s => s.id === "s32_4");
      if (player.x > 160 && s32_1 && s32_1.y > 300) s32_1.y -= 6;
      if (player.x > 280 && s32_2 && s32_2.y > 300) s32_2.y -= 6;
      if (player.x > 400 && s32_3 && s32_3.y > 300) s32_3.y -= 6;
      if (player.x > 520 && s32_4 && s32_4.y > 300) s32_4.y -= 6;
      break;
    case 33:
      if (player.x > 230 && !trapState.triggered) {
        trapState.triggered = true;
        player.gravity = 1.25;
        playSound(200, 0.15);
      }
      if (player.x > 420 && trapState.triggered) {
        player.gravity = 0.55;
      }
      break;
    case 34:
      let d34 = doors.find(d => d.id === "d34");
      let s34 = spikes.find(s => s.id === "s34_trap");
      let step34 = platforms.find(p => p.id === "p34_step");
      if (player.x > 180 && !trapState.triggered) {
        trapState.triggered = true;
        playSound(520, 0.15);
        if (d34) { d34.x = 710; d34.y = 95; }
        if (step34) { step34.solid = true; step34.invisible = false; }
      }
      if (trapState.triggered && s34 && s34.y > 300) {
        s34.y -= 6;
      }
      break;
    case 35:
      if (player.x > 540 && !trapState.triggered) {
        trapState.triggered = true;
        playSound(220, 0.25);
        let fakeD = doors.find(d => d.id === "d35_fake");
        let realD = doors.find(d => d.id === "d35_real");
        let s35 = platforms.find(p => p.id === "step35");
        let p35 = platforms.find(p => p.id === "plat35_top");
        if (fakeD) fakeD.x = -100;
        if (realD) realD.x = 382;
        if (s35) { s35.solid = true; s35.invisible = false; }
        if (p35) { p35.solid = true; p35.invisible = false; }
      }
      break;
    case 36:
      let saw36 = saws.find(s => s.id === "saw36");
      if (saw36) {
        saw36.angle += 0.3;
        if (player.x > 160 && !trapState.triggered) trapState.triggered = true;
        if (trapState.triggered) {
          if (!trapState.reversed) {
            saw36.x -= 7.5;
            if (saw36.x <= 30) { trapState.reversed = true; playSound(400, 0.1); }
          } else {
            saw36.x += 8.2;
          }
        }
      }
      break;
    case 37:
      if (player.x > 360 && !trapState.triggered) {
        trapState.triggered = true;
        player.w = 50;
        player.h = 66;
        player.y -= 30;
        playSound(240, 0.2);
      }
      if (trapState.triggered && !trapState.shrunk && (player.x < 80 || player.y <= 36)) {
        trapState.shrunk = true;
        player.w = 16;
        player.h = 20;
        player.y += 46;
        playSound(650, 0.2);
      }
      break;
    case 38:
      break;
    case 39:
      let p39l = platforms.find(p => p.id === "p39_l");
      let saw39 = saws.find(s => s.id === "saw39");
      if (player.x > 220 && !trapState.gravFlipped) {
        trapState.gravFlipped = true;
        player.gravity = -0.55;
        player.jumpForce = 11.5;
        playSound(550, 0.2);
      }
      if (trapState.gravFlipped && p39l && p39l.w > 240) p39l.w -= 5;
      if (player.x > 460 && saw39 && saw39.y < 110) {
        saw39.y += 9;
        saw39.angle += 0.25;
      }
      break;
    case 40:
      let d40 = doors.find(d => d.id === "d40");
      if (player.x > 200 && !trapState.reversed) {
        trapState.reversed = true;
        trapState.lightsOut = true;
        playSound(250, 0.2);
      }
      if (player.x > 430 && !trapState.triggered) {
        trapState.triggered = true;
        trapState.fakeWin = true;
        playWinSound();
        setTimeout(() => { trapState.fakeWin = false; }, 850);
      }
      if (d40 && Math.hypot(player.x - d40.x, player.y - d40.y) < 70 && trapState.teleCount < 1) {
        trapState.teleCount++;
        d40.x = 560;
        playSound(500, 0.12);
      }
      break;
  }
}

function update() {
  animFrame++;

  if (shakeTime > 0) {
    shakeTime--;
  }

  if (isDying) {
    for (let pt of deathParticles) {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.35;
      pt.rot += pt.vRot;
      pt.alpha = Math.max(0, deathTimer / 28);
    }
    deathTimer--;
    if (deathTimer <= 0) {
      loadStage(currentStage);
    }
    return;
  }

  if (stageClearing) {
    if (doorOpenProgress < 1) doorOpenProgress += 0.08;
    return;
  }

  updateTraps();

  let moveL = trapState.reversed ? input.right : input.left;
  let moveR = trapState.reversed ? input.left : input.right;

  if (moveL) { player.vx = -player.speed; player.facing = -1; }
  else if (moveR) { player.vx = player.speed; player.facing = 1; }
  else { player.vx = 0; }

  if (input.jump && player.grounded) {
    player.vy = player.jumpForce;
    player.grounded = false;
    playSound(380, 0.08);
  }

  player.vy += player.gravity;
  player.x += player.vx;

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  for (let p of platforms) {
    if (!p.solid) continue;
    if (rectIntersect(player, p)) {
      if (p.deadly) { die(); return; }
      if (player.vx > 0) player.x = p.x - player.w;
      else if (player.vx < 0) player.x = p.x + p.w;
    }
  }

  player.y += player.vy;
  player.grounded = false;

  for (let p of platforms) {
    if (!p.solid) continue;
    if (rectIntersect(player, p)) {
      if (p.deadly) { die(); return; }
      if (player.gravity > 0) {
        if (player.vy > 0) { player.y = p.y - player.h; player.vy = 0; player.grounded = true; }
        else if (player.vy < 0) { player.y = p.y + p.h; player.vy = 0; }
      } else {
        if (player.vy < 0) { player.y = p.y + p.h; player.vy = 0; player.grounded = true; }
        else if (player.vy > 0) { player.y = p.y - player.h; player.vy = 0; }
      }
    }
  }

  if (player.y > canvas.height || player.y + player.h < -20) {
    die();
    return;
  }

  for (let s of spikes) {
    let hitbox = s.dir === "up"
      ? { x: s.x + 6, y: s.y + 6, w: s.w - 12, h: s.h - 6 }
      : { x: s.x + 6, y: s.y, w: s.w - 12, h: s.h - 6 };
    if (rectIntersect(player, hitbox)) { die(); return; }
  }

  for (let saw of saws) {
    let cx = player.x + player.w / 2;
    let cy = player.y + player.h / 2;
    if (Math.hypot(cx - saw.x, cy - saw.y) < saw.r + 10) { die(); return; }
  }

  for (let d of doors) {
    if (rectIntersect(player, d) && d.real) { nextStage(); return; }
  }
}

function rectIntersect(r1, r2) {
  return !(r2.x >= r1.x + r1.w || r2.x + r2.w <= r1.x || r2.y >= r1.y + r1.h || r2.y + r2.h <= r1.y);
}

function draw() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (shakeTime > 0) {
    const dx = (Math.random() - 0.5) * 2 * shakeIntensity;
    const dy = (Math.random() - 0.5) * 2 * shakeIntensity;
    ctx.translate(dx, dy);
  }

  ctx.fillStyle = "#3b2016";
  for (let p of platforms) {
    if (!p.invisible) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
  }

  ctx.fillStyle = "#3b2016";
  for (let s of spikes) {
    ctx.beginPath();
    if (s.dir === "up") {
      ctx.moveTo(s.x, s.y + s.h);
      ctx.lineTo(s.x + s.w / 2, s.y);
      ctx.lineTo(s.x + s.w, s.y + s.h);
    } else {
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.w / 2, s.y + s.h);
      ctx.lineTo(s.x + s.w, s.y);
    }
    ctx.fill();
  }

  for (let saw of saws) {
    ctx.save();
    ctx.translate(saw.x, saw.y);
    ctx.rotate(saw.angle);
    ctx.fillStyle = "#3b2016";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      let angle = (i * Math.PI) / 4;
      ctx.lineTo(Math.cos(angle) * (saw.r + 6), Math.sin(angle) * (saw.r + 6));
      ctx.lineTo(Math.cos(angle + 0.3) * (saw.r - 4), Math.sin(angle + 0.3) * (saw.r - 4));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  for (let d of doors) {
    ctx.fillStyle = "#3b2016";
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.fillStyle = "#1c0d08";
    ctx.fillRect(d.x + 5, d.y + 5, d.w - 10, d.h - 5);

    let openOffset = (d.real && stageClearing) ? doorOpenProgress : 0;
    let doorLeafWidth = (d.w - 10) * (1 - openOffset * 0.85);
    ctx.fillStyle = "#d97a3a";
    ctx.fillRect(d.x + 5, d.y + 5, doorLeafWidth, d.h - 5);

    if (openOffset < 0.7) {
      ctx.fillStyle = "#3b2016";
      ctx.fillRect(d.x + 5 + doorLeafWidth - 6, d.y + 28, 4, 4);
    }
  }

  if (!isDying) {
    ctx.save();
    let centerX = player.x + player.w / 2;
    let centerY = player.y + player.h / 2;

    if (stageClearing) {
      let scale = Math.max(0, 1 - doorOpenProgress);
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
    }

    let isMoving = player.vx !== 0 && player.grounded;
    renderCharacterSprite(
      ctx,
      player.x,
      player.y,
      player.w,
      player.h,
      player.facing,
      player.gravity,
      isMoving,
      animFrame,
      currentChar
    );

    ctx.restore();
  } else {
    for (let pt of deathParticles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot);
      ctx.fillStyle = pt.color;
      ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
      ctx.restore();
    }
  }

  if (trapState.lightsOut) {
    ctx.save();
    ctx.fillStyle = "#1c0d08";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 95, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  if (trapState.fakeWin) {
    ctx.fillStyle = "#f3a86b";
    ctx.fillRect(200, 120, 400, 100);
    ctx.strokeStyle = "#26120b";
    ctx.lineWidth = 6;
    ctx.strokeRect(200, 120, 400, 100);
    ctx.fillStyle = "#3b2016";
    ctx.font = "bold 22px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("ALL 40 STAGES CLEARED!", 400, 178);
  }

  ctx.restore();
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function bindTouchButton(btnId, controlKey) {
  const btn = document.getElementById(btnId);
  const press = (e) => { e.preventDefault(); input[controlKey] = true; };
  const release = (e) => { e.preventDefault(); input[controlKey] = false; };
  btn.addEventListener("touchstart", press, { passive: false });
  btn.addEventListener("touchend", release, { passive: false });
  btn.addEventListener("touchcancel", release, { passive: false });
  btn.addEventListener("mousedown", press);
  btn.addEventListener("mouseup", release);
  btn.addEventListener("mouseleave", release);
}

bindTouchButton("btn-left", "left");
bindTouchButton("btn-right", "right");
bindTouchButton("btn-jump", "jump");

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") input.right = true;
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") input.jump = true;
  if (e.code === "KeyR" && gameRunning && !stageClearing && !isDying) die();
});
window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") input.right = false;
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") input.jump = false;
});

updateCharacterBadges();
