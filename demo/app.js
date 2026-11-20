const LABELS = ["anger", "disgust", "joy", "neutral", "sadness", "surprise"];

/** Precomputed demo outputs — no remote inference. */
const SAMPLES = [
  {
    id: "joy-1",
    title: "Joy · family",
    text: "Alhamdulillah hari ni dapat jumpa keluarga. Rasa tenang dan sangat bersyukur.",
    scores: {
      anger: 0.02,
      disgust: 0.01,
      joy: 0.78,
      neutral: 0.09,
      sadness: 0.03,
      surprise: 0.07,
    },
  },
  {
    id: "anger-1",
    title: "Anger · service",
    text: "Sudah tunggu sejam masih tak dilayan. Memang kecewa dan marah dengan servis ni.",
    scores: {
      anger: 0.71,
      disgust: 0.12,
      joy: 0.01,
      neutral: 0.08,
      sadness: 0.05,
      surprise: 0.03,
    },
  },
  {
    id: "sadness-1",
    title: "Sadness · goodbye",
    text: "Teringat hari terakhir bersama kawan lama. Rasa sepi je selepas dia pindah.",
    scores: {
      anger: 0.03,
      disgust: 0.02,
      joy: 0.04,
      neutral: 0.11,
      sadness: 0.74,
      surprise: 0.06,
    },
  },
  {
    id: "surprise-1",
    title: "Surprise · news",
    text: "Tiba-tiba dapat panggilan interview esok pagi. Tak sangka langsung!",
    scores: {
      anger: 0.02,
      disgust: 0.01,
      joy: 0.18,
      neutral: 0.07,
      sadness: 0.02,
      surprise: 0.7,
    },
  },
  {
    id: "neutral-1",
    title: "Neutral · update",
    text: "Mesyuarat dijadualkan jam 3 petang di bilik B. Sila bawa dokumen yang diperlukan.",
    scores: {
      anger: 0.03,
      disgust: 0.02,
      joy: 0.05,
      neutral: 0.81,
      sadness: 0.04,
      surprise: 0.05,
    },
  },
  {
    id: "disgust-1",
    title: "Disgust · hygiene",
    text: "Meja restoran tu kotor sangat, ada sisa makanan kering. Geram tengok.",
    scores: {
      anger: 0.16,
      disgust: 0.68,
      joy: 0.01,
      neutral: 0.07,
      sadness: 0.04,
      surprise: 0.04,
    },
  },
];

const FALLBACK = {
  id: "custom",
  scores: {
    anger: 0.08,
    disgust: 0.05,
    joy: 0.14,
    neutral: 0.42,
    sadness: 0.18,
    surprise: 0.13,
  },
};

const els = {
  textInput: document.getElementById("textInput"),
  charCount: document.getElementById("charCount"),
  sampleList: document.getElementById("sampleList"),
  computeBtn: document.getElementById("computeBtn"),
  clearBtn: document.getElementById("clearBtn"),
  outputEmpty: document.getElementById("outputEmpty"),
  outputBody: document.getElementById("outputBody"),
  scoreList: document.getElementById("scoreList"),
  predLabel: document.getElementById("predLabel"),
  latency: document.getElementById("latency"),
  infoBtn: document.getElementById("infoBtn"),
  infoPopover: document.getElementById("infoPopover"),
};

let activeSampleId = SAMPLES[0].id;
let busy = false;

function normalize(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function findSampleByText(text) {
  const key = normalize(text);
  return SAMPLES.find((sample) => normalize(sample.text) === key) || null;
}

function rankedScores(scoreMap) {
  return LABELS.map((label) => ({
    label,
    score: Number(scoreMap[label] ?? 0),
  })).sort((a, b) => b.score - a.score);
}

function updateCharCount() {
  els.charCount.textContent = `${els.textInput.value.length} / 600`;
}

function setActiveSample(id) {
  activeSampleId = id;
  for (const btn of els.sampleList.querySelectorAll(".sample-btn")) {
    btn.classList.toggle("active", btn.dataset.id === id);
  }
}

function renderSamples() {
  els.sampleList.innerHTML = "";
  for (const sample of SAMPLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sample-btn";
    btn.dataset.id = sample.id;
    btn.textContent = sample.title;
    btn.setAttribute("role", "listitem");
    btn.addEventListener("click", () => {
      els.textInput.value = sample.text;
      setActiveSample(sample.id);
      updateCharCount();
      runInference({ fromSample: true });
    });
    els.sampleList.appendChild(btn);
  }
}

function resolvePayload(text) {
  const matched = findSampleByText(text);
  if (matched) {
    return matched;
  }
  return { ...FALLBACK, text };
}

function renderOutput(scoreMap, latencyMs) {
  const ranked = rankedScores(scoreMap);
  const top = ranked[0];

  els.predLabel.textContent = top.label;
  els.scoreList.innerHTML = "";

  for (const item of ranked) {
    const li = document.createElement("li");
    li.className = "score-row" + (item.label === top.label ? " is-top" : "");

    const name = document.createElement("span");
    name.className = "score-name";
    name.textContent = item.label;

    const track = document.createElement("div");
    track.className = "score-track";
    const fill = document.createElement("div");
    fill.className = "score-fill";
    track.appendChild(fill);

    const pct = document.createElement("span");
    pct.className = "score-pct";
    pct.textContent = `${(item.score * 100).toFixed(1)}%`;

    li.append(name, track, pct);
    els.scoreList.appendChild(li);

    requestAnimationFrame(() => {
      fill.style.width = `${Math.max(item.score * 100, 1.5)}%`;
    });
  }

  els.latency.hidden = false;
  els.latency.textContent = `${latencyMs} ms`;
  els.outputEmpty.hidden = true;
  els.outputBody.hidden = false;
}

async function runInference({ fromSample = false } = {}) {
  if (busy) return;

  const text = els.textInput.value.trim();
  if (!text) {
    els.textInput.focus();
    return;
  }

  const payload = resolvePayload(text);
  if (!fromSample) {
    const matched = findSampleByText(text);
    setActiveSample(matched ? matched.id : "");
  }

  busy = true;
  els.computeBtn.disabled = true;
  els.computeBtn.classList.add("loading");

  const delay = 420 + Math.floor(Math.random() * 380);
  await new Promise((resolve) => setTimeout(resolve, delay));

  renderOutput(payload.scores, delay);

  busy = false;
  els.computeBtn.disabled = false;
  els.computeBtn.classList.remove("loading");
}

function clearAll() {
  els.textInput.value = "";
  updateCharCount();
  setActiveSample("");
  els.outputBody.hidden = true;
  els.outputEmpty.hidden = false;
  els.latency.hidden = true;
  els.textInput.focus();
}

function toggleInfo(forceClose = false) {
  const open = forceClose ? false : els.infoPopover.hasAttribute("hidden");
  if (open) {
    els.infoPopover.removeAttribute("hidden");
    els.infoBtn.setAttribute("aria-expanded", "true");
  } else {
    els.infoPopover.setAttribute("hidden", "");
    els.infoBtn.setAttribute("aria-expanded", "false");
  }
}

function boot() {
  renderSamples();

  const first = SAMPLES[0];
  els.textInput.value = first.text;
  setActiveSample(first.id);
  updateCharCount();

  els.textInput.addEventListener("input", () => {
    updateCharCount();
    const matched = findSampleByText(els.textInput.value);
    setActiveSample(matched ? matched.id : "");
  });

  els.computeBtn.addEventListener("click", () => runInference());
  els.clearBtn.addEventListener("click", clearAll);

  els.infoBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleInfo();
  });

  document.addEventListener("click", (event) => {
    if (
      !els.infoPopover.hasAttribute("hidden") &&
      !els.infoPopover.contains(event.target) &&
      event.target !== els.infoBtn
    ) {
      toggleInfo(true);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") toggleInfo(true);
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      runInference();
    }
  });

  runInference({ fromSample: true });
}

boot();
