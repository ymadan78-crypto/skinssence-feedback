// Skinssence Laser & Skincare Clinic - Patient Feedback & Review Engine
// Founder & Director: Dr. Ashima Madan

// Default Clinic Configurations
const DEFAULT_CONFIG = {
  clinicName: "Skinssence Laser and Skincare Clinic",
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJExamplePlaceID",
  doctorNames: ["Dr. Ashima Madan", "Senior Skin Specialist"],
  locationKeywords: "best laser clinic Kota, skin doctor near me, skin specialist Kota, skin clinic Talwandi",
  geminiApiKey: ""
};

// Treatment Options with Icons and SEO Tags
const TREATMENTS = [
  { id: "laser_hair", label: "Laser Hair Reduction", icon: "•", tag: "painless laser hair reduction" },
  { id: "hydrafacial", label: "HydraFacial / Medi-Facial", icon: "•", tag: "HydraFacial glow treatment" },
  { id: "acne_scars", label: "Acne & Scar Treatment", icon: "•", tag: "acne scar removal and skin texture" },
  { id: "brightening", label: "Skin Brightening & Peels", icon: "•", tag: "chemical peel and skin brightening" },
  { id: "anti_aging", label: "Anti-Aging & Botox/Fillers", icon: "•", tag: "anti-aging treatment and rejuvenation" },
  { id: "pigmentation", label: "Pigmentation & Melasma", icon: "•", tag: "pigmentation and dark spot removal" },
  { id: "hair_prp", label: "Hair Restoration / PRP", icon: "•", tag: "PRP hair therapy" },
  { id: "consultation", label: "Skin Doctor Consultation", icon: "•", tag: "expert skin specialist consultation" }
];

// Highlight Chips (What patients loved)
const HIGHLIGHTS = [
  { id: "doctor_expert", label: "Dr. Ashima's Expert Advice" },
  { id: "painless", label: "Quick & Painless" },
  { id: "visible_glow", label: "Visible Glow & Results" },
  { id: "hygiene", label: "Spotlessly Clean Clinic" },
  { id: "friendly_staff", label: "Polite & Caring Staff" },
  { id: "punctual", label: "On-Time Appointment" },
  { id: "clear_aftercare", label: "Clear Guidance" }
];

// Regional Cities / Localities for Local SEO
const LOCATIONS = [
  { id: "kota", label: "Kota", isLocal: true },
  { id: "talwandi", label: "Talwandi, Kota", isLocal: true },
  { id: "kunhari", label: "Kunhari, Kota", isLocal: true },
  { id: "kota_jn", label: "Kota Junction", isLocal: true },
  { id: "jhalawar", label: "Jhalawar", isLocal: false },
  { id: "bundi", label: "Bundi", isLocal: false },
  { id: "baran", label: "Baran", isLocal: false },
  { id: "sheopur", label: "Sheopur", isLocal: false },
  { id: "atru", label: "Atru", isLocal: false },
  { id: "ramganjmandi", label: "Ramganjmandi", isLocal: false },
  { id: "bhawanimandi", label: "Bhawanimandi", isLocal: false },
  { id: "sawaimadhopur", label: "Sawai Madhopur", isLocal: false },
  { id: "deoli", label: "Deoli", isLocal: false },
  { id: "jaipur", label: "Jaipur", isLocal: false },
  { id: "bharatpur", label: "Bharatpur", isLocal: false }
];

// Duration of Skin Concern
const DURATIONS = [
  { id: "recent", label: "Recent (1-3 months)", text: "for the past few months" },
  { id: "medium", label: "6-12 months", text: "for almost a year" },
  { id: "long", label: "1-2 years", text: "for over a year" },
  { id: "chronic", label: "Chronic (3+ years)", text: "for a long time" }
];

// App State
let state = {
  selectedTreatment: null,
  selectedHighlights: new Set(),
  selectedDoctor: "Dr. Ashima Madan",
  selectedLocation: null,
  selectedDuration: null,
  customNote: "",
  rating: 5,
  currentReviewText: "",
  config: { ...DEFAULT_CONFIG }
};

// Load Saved Config from Server and LocalStorage
async function loadConfig() {
  const saved = localStorage.getItem("skinssence_config");
  if (saved) {
    try {
      state.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Error loading local config", e);
    }
  }

  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const serverCfg = await res.json();
      state.config = { ...state.config, ...serverCfg };
      
      if (serverCfg.treatments && serverCfg.treatments.length) {
        TREATMENTS.length = 0;
        TREATMENTS.push(...serverCfg.treatments);
      }
      if (serverCfg.locations && serverCfg.locations.length) {
        LOCATIONS.length = 0;
        LOCATIONS.push(...serverCfg.locations);
      }
      
      renderTreatments();
      renderDoctorChips();
      renderLocations();
      updateUIBranding();
    }
  } catch (err) {
    // Offline / static fallback
  }

  // Pre-generate the review immediately so the box is NEVER empty
  generateReviewAction();
}

function saveConfig(newConfig) {
  state.config = { ...state.config, ...newConfig };
  localStorage.setItem("skinssence_config", JSON.stringify(state.config));
  updateUIBranding();
}

// Single Best Humanized & SEO-Optimized Review Generator
// Generates ONE perfect, authentic, natural review (even if client selects nothing)
function buildSingleBestReview(treatmentObj, highlightsList, doctor, locationObj, durationObj, customNote, clinicName) {
  const doc = doctor || "Dr. Ashima Madan";
  const clinic = clinicName || "Skinssence Laser and Skincare Clinic";

  // 1. Location Hook (Local SEO for Kota and neighboring areas)
  let locationHook = "";
  if (locationObj) {
    if (locationObj.isLocal) {
      locationHook = `Living in ${locationObj.label}, I am so glad we have such an advanced skin clinic here. `;
    } else {
      locationHook = `I traveled from ${locationObj.label} to visit ${clinic} in Kota, and it was completely worth the journey! `;
    }
  }

  // 2. Duration mention
  let durationHook = "";
  if (durationObj) {
    durationHook = `I had been dealing with this skin issue ${durationObj.text}, `;
  }

  // 3. Opening Sentence
  const defaultOpenings = [
    `Had a wonderful experience at ${clinic} in Kota!`,
    `Really impressed with the treatment and service at ${clinic}.`,
    `Visited ${clinic} in Kota and I am genuinely pleased with the results.`
  ];
  const opening = defaultOpenings[Math.floor(Math.random() * defaultOpenings.length)];

  // 4. Treatment detail
  let treatmentPart = "";
  if (treatmentObj) {
    const treatmentDetails = {
      laser_hair: "The laser hair reduction was virtually painless and done with great comfort.",
      hydrafacial: "My skin felt deeply cleansed, hydrated, and glowing right after the HydraFacial session.",
      acne_scars: "Noticeable improvement in my skin texture and acne scars even after the initial session.",
      brightening: "The peel gave my face an instant fresh, radiant glow without any irritation.",
      anti_aging: "The results look completely refreshed and natural. Very pleased with the subtlety.",
      pigmentation: "Seeing visible lightening of dark spots and pigmentation.",
      hair_prp: "The PRP procedure was done very gently with clear aftercare steps.",
      consultation: `${doc} spent thorough time analyzing my skin concerns and suggested a very practical regimen.`
    };
    treatmentPart = treatmentDetails[treatmentObj.id] || `The ${treatmentObj.label} was done very professionally.`;
  } else {
    // If client selects NO treatment, provide a clean, natural consultation & skin treatment review
    treatmentPart = `${doc} took the time to understand my skin and gave honest, genuine advice without any unnecessary procedures.`;
  }

  // 5. Highlights
  let highlightPhrases = [];
  if (highlightsList.includes("hygiene")) {
    highlightPhrases.push("The clinic is spotlessly clean and maintains high hygiene standards.");
  }
  if (highlightsList.includes("doctor_expert")) {
    highlightPhrases.push(`${doc} is very experienced and explains every step patiently.`);
  }
  if (highlightsList.includes("friendly_staff")) {
    highlightPhrases.push("The staff is polite, courteous, and very helpful.");
  }
  if (highlightsList.includes("painless")) {
    highlightPhrases.push("The entire procedure was quick, smooth, and painless.");
  }
  if (highlightsList.includes("visible_glow")) {
    highlightPhrases.push("Loved the immediate visible glow and post-treatment results.");
  }
  if (highlightsList.includes("punctual")) {
    highlightPhrases.push("Zero waiting time and punctual appointments.");
  }
  if (highlightPhrases.length === 0) {
    highlightPhrases.push("The staff is very polite and the clinic is well-equipped with modern technology.");
  }

  const highlightSentence = highlightPhrases.slice(0, 2).join(" ");

  // 6. Custom note if any
  let customPart = "";
  if (customNote && customNote.trim()) {
    customPart = ` Also appreciated that ${customNote.trim().replace(/\.$/, "")}.`;
  }

  // 7. Closing recommendation (SEO keyword: skin specialist & laser clinic in Kota)
  const closers = [
    `Definitely one of the best skin specialists and laser clinics in Kota. Highly recommended!`,
    `Would definitely recommend ${doc} and Skinssence to anyone looking for genuine skin care in Kota.`,
    `Very happy with the care and outcome. 5 stars for the team!`
  ];
  const closer = closers[Math.floor(Math.random() * closers.length)];

  // Compose the review
  return `${locationHook}${opening} ${durationHook ? durationHook + 'and ' : ''}${treatmentPart} ${highlightSentence}.${customPart} ${closer}`.replace(/\s+/g, " ").trim();
}

// Generate the single review
function generateReviewAction() {
  if (state.rating < 4) return;
  const list = Array.from(state.selectedHighlights);
  const text = buildSingleBestReview(
    state.selectedTreatment,
    list,
    state.selectedDoctor,
    state.selectedLocation,
    state.selectedDuration,
    state.customNote,
    state.config.clinicName
  );

  state.currentReviewText = text;
  const textarea = document.getElementById("activeReviewTextarea");
  if (textarea) textarea.value = text;
}

// UI Rendering
function renderTreatments() {
  const container = document.getElementById("treatmentChips");
  if (!container) return;
  container.innerHTML = TREATMENTS.map(t => {
    const isSelected = state.selectedTreatment && state.selectedTreatment.id === t.id;
    return `
      <button type="button" 
        onclick="selectTreatment('${t.id}')"
        class="px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left ${
          isSelected 
            ? 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500/30 font-semibold' 
            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
        }">
        <span class="truncate">${t.label}</span>
      </button>
    `;
  }).join("");
}

function renderHighlights() {
  const container = document.getElementById("highlightChips");
  if (!container) return;
  container.innerHTML = HIGHLIGHTS.map(h => {
    const isSelected = state.selectedHighlights.has(h.id);
    return `
      <button type="button" 
        onclick="toggleHighlight('${h.id}')"
        class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          isSelected 
            ? 'bg-stone-900 border-stone-900 text-white shadow-xs' 
            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
        }">
        ${h.label}
      </button>
    `;
  }).join("");
}

function renderDoctorChips() {
  const container = document.getElementById("doctorChips");
  if (!container) return;
  const docs = state.config.doctorNames || ["Dr. Ashima Madan", "Senior Skin Specialist"];
  container.innerHTML = docs.map(name => {
    const isSelected = state.selectedDoctor === name;
    return `
      <button type="button" 
        onclick="selectDoctor('${name}')"
        class="px-3 py-1 rounded-full border text-xs font-medium transition-all ${
          isSelected 
            ? 'bg-rose-600 border-rose-600 text-white shadow-xs' 
            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
        }">
        ${name}
      </button>
    `;
  }).join("");
}

function renderLocations() {
  const container = document.getElementById("locationChips");
  if (!container) return;
  container.innerHTML = LOCATIONS.map(loc => {
    const isSelected = state.selectedLocation && state.selectedLocation.id === loc.id;
    return `
      <button type="button" 
        onclick="selectLocation('${loc.id}')"
        class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          isSelected 
            ? 'bg-rose-600 border-rose-600 text-white shadow-xs' 
            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
        }">
        ${loc.label}
      </button>
    `;
  }).join("");
}

function renderDurations() {
  const container = document.getElementById("durationChips");
  if (!container) return;
  container.innerHTML = DURATIONS.map(d => {
    const isSelected = state.selectedDuration && state.selectedDuration.id === d.id;
    return `
      <button type="button" 
        onclick="selectDuration('${d.id}')"
        class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          isSelected 
            ? 'bg-amber-600 border-amber-600 text-white shadow-xs' 
            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
        }">
        ${d.label}
      </button>
    `;
  }).join("");
}

function renderStars() {
  const container = document.getElementById("starRating");
  if (!container) return;
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= state.rating;
    html += `
      <button type="button" onclick="setRating(${i})" class="p-1 transition-transform hover:scale-115 focus:outline-none" aria-label="${i} stars">
        <svg class="w-8 h-8 ${isFilled ? 'text-amber-400 fill-amber-400 drop-shadow-xs' : 'text-stone-300 fill-transparent stroke-stone-300'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    `;
  }
  container.innerHTML = html;

  const ratingDesc = document.getElementById("ratingDescription");
  if (ratingDesc) {
    const descMap = {
      5: "Excellent experience",
      4: "Very good",
      3: "Average (Let our Director help you)",
      2: "Below expectations",
      1: "Disappointed"
    };
    ratingDesc.innerText = descMap[state.rating] || "";
  }

  // Rating Gating
  const positiveSection = document.getElementById("positiveReviewSection");
  const privateFeedbackSection = document.getElementById("privateFeedbackSection");
  const bottomBar = document.getElementById("bottomActionBar");
  
  if (state.rating >= 4) {
    if (positiveSection) positiveSection.classList.remove("hidden");
    if (privateFeedbackSection) privateFeedbackSection.classList.add("hidden");
    if (bottomBar) bottomBar.classList.remove("hidden");
  } else {
    if (positiveSection) positiveSection.classList.add("hidden");
    if (privateFeedbackSection) privateFeedbackSection.classList.remove("hidden");
    if (bottomBar) bottomBar.classList.add("hidden");
  }
}

// User Actions
window.selectTreatment = function(id) {
  const found = TREATMENTS.find(t => t.id === id);
  if (state.selectedTreatment && state.selectedTreatment.id === id) {
    state.selectedTreatment = null;
  } else {
    state.selectedTreatment = found;
  }
  renderTreatments();
  generateReviewAction();
};

window.toggleHighlight = function(id) {
  if (state.selectedHighlights.has(id)) {
    state.selectedHighlights.delete(id);
  } else {
    state.selectedHighlights.add(id);
  }
  renderHighlights();
  generateReviewAction();
};

window.selectDoctor = function(name) {
  state.selectedDoctor = name;
  renderDoctorChips();
  generateReviewAction();
};

window.selectLocation = function(id) {
  const found = LOCATIONS.find(l => l.id === id);
  if (state.selectedLocation && state.selectedLocation.id === id) {
    state.selectedLocation = null;
  } else {
    state.selectedLocation = found;
  }
  renderLocations();
  generateReviewAction();
};

window.selectDuration = function(id) {
  const found = DURATIONS.find(d => d.id === id);
  if (state.selectedDuration && state.selectedDuration.id === id) {
    state.selectedDuration = null;
  } else {
    state.selectedDuration = found;
  }
  renderDurations();
  generateReviewAction();
};

window.handleCustomNoteInput = function(e) {
  state.customNote = e.target.value;
  generateReviewAction();
};

window.setRating = function(r) {
  state.rating = r;
  renderStars();
  if (r >= 4) {
    generateReviewAction();
  }
};

window.toggleExpandDetails = function() {
  const body = document.getElementById("expandDetailsBody");
  const icon = document.getElementById("expandChevronIcon");
  if (!body) return;
  const isHidden = body.classList.contains("hidden");
  if (isHidden) {
    body.classList.remove("hidden");
    if (icon) icon.classList.add("rotate-180");
  } else {
    body.classList.add("hidden");
    if (icon) icon.classList.remove("rotate-180");
  }
};

window.regenerateReview = function() {
  generateReviewAction();
  showToast("Review rephrased!");
};

window.handleEditorChange = function(e) {
  state.currentReviewText = e.target.value;
};

// 1-Click Copy and Open Google Review Link
window.copyAndOpenGoogleReview = async function() {
  const editor = document.getElementById("activeReviewTextarea");
  const reviewText = editor ? editor.value : state.currentReviewText;

  if (!reviewText) {
    showToast("Please wait a moment...");
    return;
  }

  // 1. Copy to clipboard
  try {
    await navigator.clipboard.writeText(reviewText);
  } catch (err) {
    const tempInput = document.createElement("textarea");
    tempInput.value = reviewText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }

  // 2. Confetti celebration
  if (window.confetti) {
    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  }

  // 3. Toast
  showToast("Review copied! Opening Google...");

  // 4. Open Google Review URL
  setTimeout(() => {
    const targetUrl = state.config.googleReviewUrl || "https://search.google.com";
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }, 450);
};

// Private feedback submit for 1-3 stars
window.submitPrivateFeedback = async function() {
  const message = document.getElementById("privateFeedbackText")?.value || "";
  const contact = document.getElementById("privateFeedbackContact")?.value || "";
  const treatmentName = state.selectedTreatment ? state.selectedTreatment.label : "General";

  if (!message.trim()) {
    showToast("Please share a brief note so we can assist you.");
    return;
  }

  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: state.rating,
        treatment: treatmentName,
        message: message.trim(),
        contact: contact.trim() || "Not provided"
      })
    });
  } catch (err) {}

  const feedbackMsg = document.getElementById("privateFeedbackSuccess");
  if (feedbackMsg) feedbackMsg.classList.remove("hidden");
  
  const submitBtn = document.getElementById("privateFeedbackSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50");
  }

  const waNumber = state.config.directorWhatsApp || "919876543210";
  const waBtn = document.getElementById("privateFeedbackWhatsAppBtn");
  if (waBtn) {
    const textMsg = encodeURIComponent(`Hello Dr. Ashima, I visited Skinssence today for ${treatmentName} and had some concerns: "${message.trim()}" (Contact: ${contact})`);
    waBtn.href = `https://wa.me/${waNumber}?text=${textMsg}`;
    waBtn.classList.remove("hidden");
  }

  showToast("Thank you. Our Director will review this personally.");
};

function showToast(msg) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 bg-stone-900/95 text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-2xl z-50 transition-all duration-300 pointer-events-none";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.remove("opacity-0", "translate-y-2");
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
  }, 3000);
}

function updateUIBranding() {
  const clinicHeaders = document.querySelectorAll(".clinic-brand-name");
  clinicHeaders.forEach(el => el.innerText = state.config.clinicName);
}

document.addEventListener("DOMContentLoaded", () => {
  renderTreatments();
  renderHighlights();
  renderDoctorChips();
  renderLocations();
  renderDurations();
  renderStars();
  loadConfig();
});
