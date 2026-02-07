const PLACES = [
  "Brewlane Cafe",
  "Sunset Noodles",
  "Metro Mall Food Court",
  "Riverside Coffee Roasters",
];

const SIGNALS = {
  openStatus: [
    { key: "open", emoji: "🟢", label: "Open" },
    { key: "soon", emoji: "🟡", label: "Closing soon" },
    { key: "closed", emoji: "🔴", label: "Closed" },
  ],
  noiseLevel: [
    { key: "quiet", emoji: "🤫", label: "Quiet" },
    { key: "moderate", emoji: "😐", label: "Moderate" },
    { key: "noisy", emoji: "📢", label: "Noisy" },
  ],
  crowdLevel: [
    { key: "empty", emoji: "🟢", label: "Empty" },
    { key: "moderate", emoji: "🟡", label: "Moderate" },
    { key: "packed", emoji: "🔴", label: "Packed" },
  ],
};

const STORAGE_KEY = "now-or-nah-data";
const placeSelect = document.getElementById("place");
const lastUpdated = document.getElementById("last-updated");
const resetButton = document.getElementById("reset");

const state = {
  selectedPlace: PLACES[0],
  data: loadData(),
};

init();

function init() {
  setupPlaces();
  setupSignalButtons();
  bindEvents();
  render();
}

function setupPlaces() {
  PLACES.forEach((place) => {
    const option = document.createElement("option");
    option.value = place;
    option.textContent = place;
    placeSelect.appendChild(option);
  });
  placeSelect.value = state.selectedPlace;
}

function setupSignalButtons() {
  Object.entries(SIGNALS).forEach(([signalName, options]) => {
    const wrapper = document.getElementById(`${signalName}-buttons`);
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tap-btn";
      button.dataset.signal = signalName;
      button.dataset.option = option.key;
      button.textContent = `${option.emoji} ${option.label}`;
      wrapper.appendChild(button);
    });
  });
}

function bindEvents() {
  placeSelect.addEventListener("change", () => {
    state.selectedPlace = placeSelect.value;
    render();
  });

  document.body.addEventListener("click", (event) => {
    const btn = event.target.closest(".tap-btn");
    if (!btn) return;

    const { signal, option } = btn.dataset;
    recordVote(state.selectedPlace, signal, option);
    render();
  });

  resetButton.addEventListener("click", () => {
    state.data[state.selectedPlace] = buildEmptyPlaceData();
    saveData();
    render();
  });
}

function recordVote(place, signal, option) {
  const placeData = ensurePlaceData(place);
  placeData[signal][option] += 1;
  placeData.updatedAt = new Date().toISOString();
  saveData();
}

function render() {
  const placeData = ensurePlaceData(state.selectedPlace);

  Object.entries(SIGNALS).forEach(([signalName, options]) => {
    const winningKey = getWinningOptionKey(placeData[signalName]);
    const winningOption = options.find((option) => option.key === winningKey) || options[0];

    const display = document.getElementById(`${signalName}-display`);
    display.textContent = `${winningOption.emoji} ${winningOption.label}`;

    const buttons = document.querySelectorAll(`.tap-btn[data-signal="${signalName}"]`);
    buttons.forEach((button) => {
      const optionKey = button.dataset.option;
      const count = placeData[signalName][optionKey];
      button.classList.toggle("active", optionKey === winningKey);
      button.textContent = `${getOption(signalName, optionKey).emoji} ${getOption(signalName, optionKey).label} (${count})`;
    });
  });

  lastUpdated.textContent = placeData.updatedAt
    ? `Last update: ${new Date(placeData.updatedAt).toLocaleString()}`
    : "No updates yet. Be the first to tap.";
}

function getOption(signalName, key) {
  return SIGNALS[signalName].find((option) => option.key === key);
}

function getWinningOptionKey(optionCounts) {
  return Object.entries(optionCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
}

function ensurePlaceData(place) {
  if (!state.data[place]) {
    state.data[place] = buildEmptyPlaceData();
    saveData();
  }
  return state.data[place];
}

function buildEmptyPlaceData() {
  return {
    openStatus: { open: 0, soon: 0, closed: 0 },
    noiseLevel: { quiet: 0, moderate: 0, noisy: 0 },
    crowdLevel: { empty: 0, moderate: 0, packed: 0 },
    updatedAt: null,
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}
