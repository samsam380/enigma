const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ROTORS = {
  I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ" },
  II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE" },
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO" }
};
const REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
const TOTAL_KEYS = 26 * 26 * 26;
const CHALLENGE_PLAIN = "THE FLEET WILL ATTACK AT DAWN";
const SECRET_START = [12, 4, 19]; // M E T

const els = {
  messageInput: document.getElementById("messageInput"),
  rotorLeft: document.getElementById("rotorLeft"),
  rotorMiddle: document.getElementById("rotorMiddle"),
  rotorRight: document.getElementById("rotorRight"),
  plugboardInput: document.getElementById("plugboardInput"),
  machineForm: document.getElementById("machineForm"),
  oneStepBtn: document.getElementById("oneStepBtn"),
  resetBtn: document.getElementById("resetBtn"),
  cipherOutput: document.getElementById("cipherOutput"),
  signalLesson: document.getElementById("signalLesson"),
  lampboard: document.getElementById("lampboard"),
  leftWindow: document.getElementById("leftWindow"),
  middleWindow: document.getElementById("middleWindow"),
  rightWindow: document.getElementById("rightWindow"),
  challengeCipher: document.getElementById("challengeCipher"),
  startCrackBtn: document.getElementById("startCrackBtn"),
  pauseCrackBtn: document.getElementById("pauseCrackBtn"),
  resetCrackBtn: document.getElementById("resetCrackBtn"),
  speedSlider: document.getElementById("speedSlider"),
  speedLabel: document.getElementById("speedLabel"),
  attemptCounter: document.getElementById("attemptCounter"),
  progressFill: document.getElementById("progressFill"),
  currentKey: document.getElementById("currentKey"),
  rejectedCount: document.getElementById("rejectedCount"),
  crackStatus: document.getElementById("crackStatus"),
  scanWindow: document.getElementById("scanWindow"),
  foundPanel: document.getElementById("foundPanel"),
  foundText: document.getElementById("foundText"),
  foundKey: document.getElementById("foundKey")
};

let machineCursor = 0;
let lastCipher = "";
let challengeCipher = "";
let crackIndex = 0;
let crackRunning = false;
let rafId = null;

function indexToLetter(index) {
  return ALPHABET[((index % 26) + 26) % 26];
}

function letterToIndex(letter) {
  return ALPHABET.indexOf(letter);
}

function sanitize(text) {
  return (text || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function groupsOfFive(text) {
  return text.replace(/(.{5})/g, "$1 ").trim();
}

function populateRotorSelectors() {
  [els.rotorLeft, els.rotorMiddle, els.rotorRight].forEach(select => {
    select.innerHTML = "";
    for (const letter of ALPHABET) {
      const option = document.createElement("option");
      option.value = letter;
      option.textContent = letter;
      select.appendChild(option);
    }
  });
}

function buildLampboard() {
  els.lampboard.innerHTML = "";
  for (const letter of ALPHABET) {
    const lamp = document.createElement("div");
    lamp.className = "lamp";
    lamp.dataset.letter = letter;
    lamp.textContent = letter;
    els.lampboard.appendChild(lamp);
  }
}

function parsePlugboard(raw) {
  const clean = sanitize(raw);
  const map = Object.fromEntries([...ALPHABET].map(letter => [letter, letter]));
  const used = new Set();

  for (let i = 0; i < clean.length; i += 2) {
    const a = clean[i];
    const b = clean[i + 1];
    if (!a || !b || a === b || used.has(a) || used.has(b)) continue;
    map[a] = b;
    map[b] = a;
    used.add(a);
    used.add(b);
  }
  return map;
}

function getSelectedPositions() {
  return [els.rotorLeft.value, els.rotorMiddle.value, els.rotorRight.value].map(letterToIndex);
}

function setSelectedPositions(positions) {
  [els.rotorLeft, els.rotorMiddle, els.rotorRight].forEach((select, idx) => {
    select.value = indexToLetter(positions[idx]);
  });
  updateRotorWindows(positions);
}

function updateRotorWindows(positions) {
  els.leftWindow.textContent = indexToLetter(positions[0]);
  els.middleWindow.textContent = indexToLetter(positions[1]);
  els.rightWindow.textContent = indexToLetter(positions[2]);
}

function stepRotors(positions) {
  // Teaching simplification: odometer stepping. Right rotor moves every key.
  // Middle rotor advances after the right rotor wraps; left advances after the middle wraps.
  positions[2] = (positions[2] + 1) % 26;
  if (positions[2] === 0) {
    positions[1] = (positions[1] + 1) % 26;
    if (positions[1] === 0) positions[0] = (positions[0] + 1) % 26;
  }
  return positions;
}

function rotorForward(index, wiring, offset) {
  const shifted = (index + offset) % 26;
  const wiredLetter = wiring[shifted];
  return (letterToIndex(wiredLetter) - offset + 26) % 26;
}

function rotorBackward(index, wiring, offset) {
  const shiftedLetter = indexToLetter(index + offset);
  const wiredIndex = wiring.indexOf(shiftedLetter);
  return (wiredIndex - offset + 26) % 26;
}

function enigmaLetter(letter, positions, plugboard, collectPath = false) {
  if (!ALPHABET.includes(letter)) return { letter, path: [] };

  stepRotors(positions);
  const path = [];
  let current = letter;
  path.push(["input", current]);

  current = plugboard[current] || current;
  path.push(["plugIn", current]);

  let idx = letterToIndex(current);
  idx = rotorForward(idx, ROTORS.III.wiring, positions[2]);
  path.push(["r3f", indexToLetter(idx)]);

  idx = rotorForward(idx, ROTORS.II.wiring, positions[1]);
  path.push(["r2f", indexToLetter(idx)]);

  idx = rotorForward(idx, ROTORS.I.wiring, positions[0]);
  path.push(["r1f", indexToLetter(idx)]);

  idx = letterToIndex(REFLECTOR_B[idx]);
  path.push(["reflect", indexToLetter(idx)]);

  idx = rotorBackward(idx, ROTORS.I.wiring, positions[0]);
  path.push(["r1b", indexToLetter(idx)]);

  idx = rotorBackward(idx, ROTORS.II.wiring, positions[1]);
  path.push(["r2b", indexToLetter(idx)]);

  idx = rotorBackward(idx, ROTORS.III.wiring, positions[2]);
  path.push(["r3b", indexToLetter(idx)]);

  current = indexToLetter(idx);
  current = plugboard[current] || current;
  path.push(["plugOut", current]);
  path.push(["output", current]);

  return { letter: current, path: collectPath ? path : [] };
}

function enigmaText(text, startPositions, plugboard = parsePlugboard(""), collectLastPath = false) {
  const positions = [...startPositions];
  let output = "";
  let lastPath = [];
  for (const letter of sanitize(text)) {
    const result = enigmaLetter(letter, positions, plugboard, collectLastPath);
    output += result.letter;
    if (collectLastPath) lastPath = result.path;
  }
  return { output, positions, lastPath };
}

function animatePath(path) {
  document.querySelectorAll(".path-node").forEach(node => {
    node.classList.remove("active");
    node.querySelector("strong").textContent = "—";
  });
  document.querySelectorAll(".lamp").forEach(lamp => lamp.classList.remove("on"));

  path.forEach(([nodeName, letter], index) => {
    setTimeout(() => {
      const node = document.querySelector(`[data-node="${nodeName}"]`);
      if (!node) return;
      node.classList.add("active");
      node.querySelector("strong").textContent = letter;
      if (nodeName === "output") {
        const lamp = document.querySelector(`.lamp[data-letter="${letter}"]`);
        if (lamp) lamp.classList.add("on");
      }
    }, index * 80);
  });
}

function encryptFullMessage(event) {
  if (event) event.preventDefault();
  const start = getSelectedPositions();
  const plugboard = parsePlugboard(els.plugboardInput.value);
  const result = enigmaText(els.messageInput.value, start, plugboard, true);
  lastCipher = result.output;
  els.cipherOutput.textContent = groupsOfFive(result.output) || "—";
  setSelectedPositions(result.positions);
  machineCursor = sanitize(els.messageInput.value).length;

  if (result.lastPath.length) {
    animatePath(result.lastPath);
    const input = result.lastPath[0][1];
    const output = result.lastPath[result.lastPath.length - 1][1];
    els.signalLesson.textContent = `${input} became ${output}. The rotors moved first, then the signal passed through plugboard → rotors → reflector → rotors → plugboard.`;
  }
}

function encryptOneLetter() {
  const clean = sanitize(els.messageInput.value);
  if (!clean) return;
  const letter = clean[machineCursor % clean.length];
  const positions = getSelectedPositions();
  const plugboard = parsePlugboard(els.plugboardInput.value);
  const result = enigmaLetter(letter, positions, plugboard, true);
  lastCipher += result.letter;
  machineCursor += 1;
  els.cipherOutput.textContent = groupsOfFive(lastCipher);
  setSelectedPositions(positions);
  animatePath(result.path);
  els.signalLesson.textContent = `Step ${machineCursor}: input ${letter} lit ${result.letter}. Notice the rotor windows changed before encryption.`;
}

function resetMachine() {
  machineCursor = 0;
  lastCipher = "";
  els.cipherOutput.textContent = "—";
  els.signalLesson.textContent = "Press encrypt to see one letter become another through a changing path.";
  setSelectedPositions([0, 0, 0]);
  document.querySelectorAll(".path-node").forEach(node => {
    node.classList.remove("active");
    node.querySelector("strong").textContent = "—";
  });
  document.querySelectorAll(".lamp").forEach(lamp => lamp.classList.remove("on"));
}

function keyFromIndex(index) {
  const left = Math.floor(index / 676);
  const middle = Math.floor(index / 26) % 26;
  const right = index % 26;
  return [left, middle, right];
}

function keyToString(positions) {
  return positions.map(indexToLetter).join("");
}

function createChallenge() {
  challengeCipher = enigmaText(CHALLENGE_PLAIN, SECRET_START).output;
  els.challengeCipher.textContent = groupsOfFive(challengeCipher);
}

function addScanRow(key, text, hit = false) {
  const row = document.createElement("div");
  row.className = `scan-row ${hit ? "hit" : ""}`;
  row.innerHTML = `<strong>${key}</strong><span>${groupsOfFive(text).slice(0, 72)}</span>`;
  els.scanWindow.prepend(row);
  while (els.scanWindow.childElementCount > 14) {
    els.scanWindow.removeChild(els.scanWindow.lastElementChild);
  }
}

function updateCrackUi() {
  els.attemptCounter.textContent = `${Math.min(crackIndex, TOTAL_KEYS).toLocaleString()} / ${TOTAL_KEYS.toLocaleString()}`;
  els.rejectedCount.textContent = Math.max(0, crackIndex - 1).toLocaleString();
  els.progressFill.style.width = `${Math.min(100, (crackIndex / TOTAL_KEYS) * 100)}%`;
}

function bruteForceFrame() {
  if (!crackRunning) return;
  const triesPerFrame = Number(els.speedSlider.value);

  for (let i = 0; i < triesPerFrame && crackIndex < TOTAL_KEYS; i += 1) {
    const candidate = keyFromIndex(crackIndex);
    const key = keyToString(candidate);
    const plain = enigmaText(challengeCipher, candidate).output;

    els.currentKey.textContent = key;
    if (crackIndex % Math.max(1, Math.floor(400 / triesPerFrame)) === 0) {
      addScanRow(key, plain);
    }

    crackIndex += 1;

    if (plain.includes("DAWN") && plain.includes("ATTACK")) {
      crackRunning = false;
      els.crackStatus.textContent = "Found";
      addScanRow(key, plain, true);
      els.foundPanel.classList.remove("hidden");
      els.foundText.textContent = groupsOfFive(plain);
      els.foundKey.textContent = `Starting rotor key: ${key}. The game did not “understand” the message; it simply tried keys until the decrypted text matched the clue.`;
      els.startCrackBtn.disabled = false;
      cancelAnimationFrame(rafId);
      updateCrackUi();
      return;
    }
  }

  if (crackIndex >= TOTAL_KEYS) {
    crackRunning = false;
    els.crackStatus.textContent = "Not found";
    els.startCrackBtn.disabled = false;
    updateCrackUi();
    return;
  }

  updateCrackUi();
  rafId = requestAnimationFrame(bruteForceFrame);
}

function startCrack() {
  if (crackRunning) return;
  crackRunning = true;
  els.crackStatus.textContent = "Scanning";
  els.startCrackBtn.disabled = true;
  els.foundPanel.classList.add("hidden");
  rafId = requestAnimationFrame(bruteForceFrame);
}

function pauseCrack() {
  crackRunning = false;
  els.crackStatus.textContent = "Paused";
  els.startCrackBtn.disabled = false;
  if (rafId) cancelAnimationFrame(rafId);
}

function resetCrack() {
  pauseCrack();
  crackIndex = 0;
  els.scanWindow.innerHTML = "";
  els.currentKey.textContent = "AAA";
  els.rejectedCount.textContent = "0";
  els.crackStatus.textContent = "Ready";
  els.foundPanel.classList.add("hidden");
  updateCrackUi();
  createChallenge();
}

function wireEvents() {
  els.machineForm.addEventListener("submit", encryptFullMessage);
  els.oneStepBtn.addEventListener("click", encryptOneLetter);
  els.resetBtn.addEventListener("click", resetMachine);
  [els.rotorLeft, els.rotorMiddle, els.rotorRight].forEach(select => {
    select.addEventListener("change", () => updateRotorWindows(getSelectedPositions()));
  });

  els.startCrackBtn.addEventListener("click", startCrack);
  els.pauseCrackBtn.addEventListener("click", pauseCrack);
  els.resetCrackBtn.addEventListener("click", resetCrack);
  els.speedSlider.addEventListener("input", () => {
    els.speedLabel.textContent = `${els.speedSlider.value} tries/frame`;
  });
}

function init() {
  populateRotorSelectors();
  buildLampboard();
  setSelectedPositions([0, 0, 0]);
  createChallenge();
  updateCrackUi();
  wireEvents();
}

init();
