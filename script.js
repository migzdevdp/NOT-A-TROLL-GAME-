const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const victoryModal = document.getElementById("victory-modal");
const playBtn = document.getElementById("play-btn");
const replayBtn = document.getElementById("replay-btn");
const menuBtn = document.getElementById("menu-btn");
const resetBtn = document.getElementById("reset-btn");
const lvlDisplay = document.getElementById("lvl-display");
const deathDisplay = document.getElementById("death-display");
const finalDeathsDisplay = document.getElementById("final-deaths");

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
let deaths = 0;
let gameRunning = false;
let animFrame = 0;
let stageClearing = false;
let doorOpenProgress = 0;

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

function startNewRun() {
  playSound(500, 0.15);
  titleScreen.classList.add("hidden");
  victoryModal.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  input.left = false;
  input.right = false;
  input.jump = false;
  currentStage = 1;
  deaths = 0;
  stageClearing = false;
  updateHUD();
  loadStage(currentStage);
  if (!gameRunning) {
    gameRunning = true;
    gameLoop();
  }
}

playBtn.addEventListener("click", startNewRun);
replayBtn.addEventListener("click", startNewRun);

menuBtn.addEventListener("click", () => {
  input.left = false;
  input.right = false;
  input.jump = false;
  gameScreen.classList.add("hidden");
  victoryModal.classList.add("hidden");
  titleScreen.classList.remove("hidden");
});

resetBtn.addEventListener("click", () => {
  if (!stageClearing) {
    die();
  }
});

function updateHUD() {
  lvlDisplay.innerText = currentStage;
  deathDisplay.innerText = deaths;
}

function die() {
  if (stageClearing) return;
  deaths++;
  updateHUD();
  playSound(140, 0.25, "sawtooth");
  loadStage(currentStage);
}

function nextStage() {
  if (stageClearing) return;
  stageClearing = true;
  doorOpenProgress = 0;
  player.vx = 0;
  player.vy = 0;
  playWinSound();

  setTimeout(() => {
    stageClearing = false;
    if (currentStage < 30) {
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

  platforms = [];
  spikes = [];
  doors = [];
  saws = [];
  trapState = { triggered: false, reversed: false, gravFlipped: false, lightsOut: false, fakeWin: false, teleCount: 0 };

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
        setTimeout(() => { if (currentStage === 15) die(); }, 1200);
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
  }
}
function update() {
  animFrame++;
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

  if (player.y > canvas.height || player.y + player.h < -20) { die(); return; }

  for (let s of spikes) {
    let hitbox = { x: s.x + 4, y: s.y + 4, w: s.w - 8, h: s.h - 4 };
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#3b2016";
  for (let p of platforms) {
    if (!p.invisible) ctx.fillRect(p.x, p.y, p.w, p.h);
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

  ctx.save();
  if (stageClearing) {
    let scale = Math.max(0, 1 - doorOpenProgress);
    let centerX = player.x + player.w / 2;
    let centerY = player.y + player.h / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
  }

  ctx.fillStyle = "#1c0d08";
  ctx.fillRect(player.x + 4, player.y, player.w - 8, player.h - 8);
  ctx.fillStyle = "#f3a86b";
  let eyeX = player.facing === 1 ? player.x + player.w - 13 : player.x + 7;
  let eyeY = player.gravity > 0 ? player.y + 7 : player.y + player.h - 18;
  ctx.fillRect(eyeX, eyeY, 4, 4);

  ctx.fillStyle = "#1c0d08";
  let legOffset = player.vx !== 0 && player.grounded ? Math.sin(animFrame * 0.4) * 5 : 0;
  if (player.gravity > 0) {
    ctx.fillRect(player.x + 6, player.y + player.h - 8 + legOffset, 5, 8);
    ctx.fillRect(player.x + player.w - 11, player.y + player.h - 8 - legOffset, 5, 8);
  } else {
    ctx.fillRect(player.x + 6, player.y - legOffset, 5, 8);
    ctx.fillRect(player.x + player.w - 11, player.y + legOffset, 5, 8);
  }
  ctx.restore();

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
    ctx.fillText("ALL 30 STAGES CLEARED!", 400, 178);
  }
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
