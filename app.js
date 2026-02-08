const places = [
  {
    name: "Campus Hawker Hub",
    placeStatus: "open",
    crowdLevel: "packed",
    noiseLevel: "loud",
    stockLevel: "plenty",
    avgPrice: 5.5,
    priceTier: "cheap",
    calories: "medium",
    protein: "high",
    healthTag: "balanced",
    walkMinutes: 6,
    totalVisitMinutes: 25,
    tags: ["halal", "spicy"],
  },
  {
    name: "Green Bowl Café",
    placeStatus: "open",
    crowdLevel: "moderate",
    noiseLevel: "quiet",
    stockLevel: "low",
    avgPrice: 10,
    priceTier: "expensive",
    calories: "low",
    protein: "medium",
    healthTag: "healthy",
    walkMinutes: 8,
    totalVisitMinutes: 35,
    tags: ["vegetarian"],
  },
  {
    name: "Noodle Express",
    placeStatus: "closing_soon",
    crowdLevel: "empty",
    noiseLevel: "moderate",
    stockLevel: "almost_out",
    avgPrice: 4.2,
    priceTier: "cheap",
    calories: "high",
    protein: "low",
    healthTag: "indulgent",
    walkMinutes: 12,
    totalVisitMinutes: 45,
    tags: ["spicy"],
  },
  {
    name: "Protein Kitchen",
    placeStatus: "open",
    crowdLevel: "moderate",
    noiseLevel: "moderate",
    stockLevel: "plenty",
    avgPrice: 7.8,
    priceTier: "medium",
    calories: "medium",
    protein: "high",
    healthTag: "healthy",
    walkMinutes: 9,
    totalVisitMinutes: 32,
    tags: ["halal"],
  },
  {
    name: "Night Owl Snacks",
    placeStatus: "closed",
    crowdLevel: "empty",
    noiseLevel: "quiet",
    stockLevel: "low",
    avgPrice: 3.8,
    priceTier: "cheap",
    calories: "high",
    protein: "low",
    healthTag: "indulgent",
    walkMinutes: 4,
    totalVisitMinutes: 20,
    tags: [],
  },
];

const statusMeta = {
  open: { icon: "🟢", label: "Open", score: 2 },
  closing_soon: { icon: "🟡", label: "Closing soon", score: -1 },
  closed: { icon: "🔴", label: "Closed", score: -4 },
};

const triMeta = {
  crowdLevel: {
    empty: { icon: "🟢", label: "Empty", score: 2 },
    moderate: { icon: "🟡", label: "Moderate", score: 0 },
    packed: { icon: "🔴", label: "Packed", score: -2 },
  },
  noiseLevel: {
    quiet: { icon: "🤫", label: "Quiet", score: 1 },
    moderate: { icon: "😐", label: "Moderate", score: 0 },
    loud: { icon: "📢", label: "Loud", score: -1 },
  },
  stockLevel: {
    plenty: { icon: "🟢", label: "Plenty", score: 2 },
    low: { icon: "🟡", label: "Low", score: -1 },
    almost_out: { icon: "🔴", label: "Almost out", score: -3 },
  },
};

const goalScoring = {
  weight_loss: (place) => {
    let score = 0;
    if (place.calories === "low") score += 2;
    if (place.calories === "high") score -= 2;
    if (place.healthTag === "healthy") score += 2;
    if (place.healthTag === "indulgent") score -= 1;
    if (place.protein === "high") score += 1;
    return score;
  },
  muscle_gain: (place) => {
    let score = 0;
    if (place.protein === "high") score += 3;
    if (place.calories === "medium" || place.calories === "high") score += 1;
    if (place.protein === "low") score -= 2;
    return score;
  },
  budget_survival: (place, inputs) => {
    let score = place.avgPrice <= inputs.budgetCap ? 3 : -3;
    if (place.priceTier === "cheap") score += 2;
    if (place.priceTier === "expensive") score -= 1;
    return score;
  },
  starving: (place) => {
    let score = 0;
    if (place.stockLevel === "plenty") score += 2;
    if (place.placeStatus === "open") score += 1;
    if (place.crowdLevel === "packed") score -= 1;
    return score;
  },
};

const inputs = {
  goalMode: document.querySelector("#goalMode"),
  budgetCap: document.querySelector("#budgetCap"),
  maxWalk: document.querySelector("#maxWalk"),
  timeAvailable: document.querySelector("#timeAvailable"),
  preference: document.querySelector("#preference"),
};

const placesContainer = document.querySelector("#places");
const template = document.querySelector("#placeTemplate");

function metricClass(score) {
  if (score >= 1) return "good";
  if (score <= -1) return "bad";
  return "warn";
}

function evaluate(place, prefs) {
  let score = 0;
  const reasons = [];

  // 1) Place status
  score += statusMeta[place.placeStatus].score;
  score += triMeta.crowdLevel[place.crowdLevel].score;
  score += triMeta.noiseLevel[place.noiseLevel].score;

  // 2) Availability and price
  score += triMeta.stockLevel[place.stockLevel].score;
  if (place.avgPrice <= prefs.budgetCap) {
    score += 2;
    reasons.push("within budget");
  } else {
    score -= 2;
    reasons.push("over budget cap");
  }

  // 3) Nutrition fit
  score += goalScoring[prefs.goalMode](place, prefs);

  // 4) Constraints
  if (place.walkMinutes <= prefs.maxWalk) {
    score += 2;
    reasons.push(`${place.walkMinutes}-min walk`);
  } else {
    score -= 2;
    reasons.push(`too far (${place.walkMinutes} mins)`);
  }

  if (place.totalVisitMinutes <= prefs.timeAvailable) {
    score += 1;
  } else {
    score -= 2;
    reasons.push("likely too slow between classes");
  }

  if (prefs.preference !== "none") {
    if (place.tags.includes(prefs.preference)) {
      score += 2;
      reasons.push(`${prefs.preference} option`);
    } else {
      score -= 2;
      reasons.push(`missing ${prefs.preference}`);
    }
  }

  let verdict = "❌ SKIP";
  let verdictClass = "skip";
  if (score >= 5) {
    verdict = "✅ GO & EAT";
    verdictClass = "go";
  } else if (score >= 1) {
    verdict = "🤔 ONLY IF DESPERATE";
    verdictClass = "desperate";
  }

  const headline = buildExplanation(place, reasons);

  return { score, verdict, verdictClass, headline };
}

function buildExplanation(place, reasons) {
  const quick = [];
  quick.push(`${place.priceTier}, ${place.protein}-protein`);
  quick.push(`${place.walkMinutes}-min walk`);

  if (place.crowdLevel === "packed") quick.push("but crowded");
  if (place.stockLevel === "almost_out") quick.push("stock almost out");
  if (place.placeStatus === "closed") quick.push("currently closed");

  return `${quick.join(", ")}. ${reasons.slice(0, 2).join(", ")}.`;
}

function render() {
  const prefs = {
    goalMode: inputs.goalMode.value,
    budgetCap: Number(inputs.budgetCap.value),
    maxWalk: Number(inputs.maxWalk.value),
    timeAvailable: Number(inputs.timeAvailable.value),
    preference: inputs.preference.value,
  };

  placesContainer.innerHTML = "";

  const ranked = places
    .map((place) => ({ place, result: evaluate(place, prefs) }))
    .sort((a, b) => b.result.score - a.result.score);

  ranked.forEach(({ place, result }) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".name").textContent = place.name;
    const decision = node.querySelector(".decision");
    decision.textContent = result.verdict;
    decision.classList.add(result.verdictClass);
    node.querySelector(".explanation").textContent = result.headline;

    const metrics = node.querySelector(".metrics");
    const pills = [
      [
        `Status ${statusMeta[place.placeStatus].icon} ${statusMeta[place.placeStatus].label}`,
        statusMeta[place.placeStatus].score,
      ],
      [
        `Crowd ${triMeta.crowdLevel[place.crowdLevel].icon} ${triMeta.crowdLevel[place.crowdLevel].label}`,
        triMeta.crowdLevel[place.crowdLevel].score,
      ],
      [
        `Noise ${triMeta.noiseLevel[place.noiseLevel].icon} ${triMeta.noiseLevel[place.noiseLevel].label}`,
        triMeta.noiseLevel[place.noiseLevel].score,
      ],
      [
        `Stock ${triMeta.stockLevel[place.stockLevel].icon} ${triMeta.stockLevel[place.stockLevel].label}`,
        triMeta.stockLevel[place.stockLevel].score,
      ],
      [`Price $${place.avgPrice.toFixed(2)} (${place.priceTier})`, place.avgPrice <= prefs.budgetCap ? 1 : -1],
      [`Health ${place.healthTag} | Cal ${place.calories} | Protein ${place.protein}`, 0],
    ];

    pills.forEach(([text, pillScore]) => {
      const span = document.createElement("span");
      span.className = `metric-pill ${metricClass(pillScore)}`;
      span.textContent = text;
      metrics.appendChild(span);
    });

    placesContainer.appendChild(node);
  });
}

Object.values(inputs).forEach((input) => input.addEventListener("input", render));
render();
