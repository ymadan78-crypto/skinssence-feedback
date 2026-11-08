// Skinssence Laser & Skincare Clinic - Patient Feedback & Review Engine
// Founder & Director: Dr. Ashima Madan

// Default Clinic Configurations
const DEFAULT_CONFIG = {
  clinicName: "Skinssence Laser and Skincare Clinic",
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJExamplePlaceID",
  directorWhatsApp: "919876543210",
  directorEmail: "director@skinssence.com",
  doctorNames: ["Dr. Ashima Madan", "Senior Skin Specialist"],
  locationKeywords: "best laser clinic Kota, skin doctor near me, skin specialist Kota, skin clinic Talwandi",
  geminiApiKey: ""
};

// Core Clinical Treatments (Botox & Fillers removed as clinic doesn't offer them)
const TREATMENTS = [
  { id: "laser_hair", label: "Laser Hair Reduction", tag: "painless laser hair reduction" },
  { id: "hydrafacial", label: "HydraFacial / Medi-Facial", tag: "HydraFacial glow treatment" },
  { id: "acne_scars", label: "Acne & Scar Treatment", tag: "acne scar removal and skin texture" },
  { id: "brightening", label: "Skin Brightening & Peels", tag: "chemical peel and skin brightening" },
  { id: "pigmentation", label: "Pigmentation & Melasma", tag: "pigmentation and dark spot removal" },
  { id: "hair_prp", label: "Hair Restoration / PRP", tag: "PRP hair therapy" },
  { id: "consultation", label: "Skin Doctor Consultation", tag: "expert skin specialist consultation" },
  { id: "other_procedure", label: "Other Procedure", tag: "specialized clinical skin procedure" }
];

// Highlight Chips (What patients loved - Multiple select allowed)
const HIGHLIGHTS = [
  { id: "doctor_expert", label: "Dr. Ashima's Expert Advice" },
  { id: "painless", label: "Quick & Painless" },
  { id: "visible_glow", label: "Visible Glow & Results" },
  { id: "hygiene", label: "Spotlessly Clean Clinic" },
  { id: "friendly_staff", label: "Polite & Caring Staff" },
  { id: "punctual", label: "On-Time Appointment" },
  { id: "clear_aftercare", label: "Clear Guidance" }
];

// Doctor & Focus Chips
const DOCTOR_FOCUS_OPTIONS = [
  { id: "dr_ashima", label: "Dr. Ashima Madan" },
  { id: "skin_doctor", label: "Skin Doctor" },
  { id: "cosmetologist", label: "Medical Cosmetologist" },
  { id: "skincare_clinic", label: "Skincare Clinic" }
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

// App State (Supports multiple treatments and multiple highlights!)
let state = {
  selectedTreatments: new Set(),
  selectedHighlights: new Set(),
  selectedFocus: "dr_ashima",
  selectedLocation: null,
  selectedDuration: null,
  customNote: "",
  rating: 5,
  currentReviewText: "",
  config: { ...DEFAULT_CONFIG }
};

// Clean out any legacy cached names
function sanitizeConfig(cfg) {
  cfg.doctorNames = ["Dr. Ashima Madan", "Senior Skin Specialist"];
  if (cfg.locationKeywords && /dermatologist/i.test(cfg.locationKeywords)) {
    cfg.locationKeywords = cfg.locationKeywords.replace(/dermatologist/gi, "skin specialist");
  }
}

// Load Saved Config from Server and LocalStorage
async function loadConfig() {
  const saved = localStorage.getItem("skinssence_config");
  if (saved) {
    try {
      state.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      sanitizeConfig(state.config);
    } catch (e) {
      console.error("Error loading local config", e);
    }
  }

  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const serverCfg = await res.json();
      state.config = { ...state.config, ...serverCfg };
      sanitizeConfig(state.config);
      
      if (serverCfg.locations && serverCfg.locations.length) {
        LOCATIONS.length = 0;
        LOCATIONS.push(...serverCfg.locations);
      }
      
      renderTreatments();
      renderHighlights();
      renderDoctorChips();
      renderLocations();
      updateUIBranding();
    }
  } catch (err) {}

  sanitizeConfig(state.config);
  state.selectedFocus = "dr_ashima";
  localStorage.setItem("skinssence_config", JSON.stringify(state.config));

  // Pre-generate the review immediately so the box is NEVER empty
  generateReviewAction();
}

// Single Best Humanized & SEO-Optimized Review Generator
// Handles multiple treatments, multiple highlights, custom procedures, and focus
function buildSingleBestReview(treatmentIds, highlightsList, focusId, locationObj, durationObj, customNote, clinicName) {
  const clinic = clinicName || "Skinssence Laser and Skincare Clinic";

  // 1. Location Hook (Local SEO for Kota and surrounding districts)
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

  // 3. Opening & Focus Sentence based on chosen chip
  let opening = "";
  let focusSentence = "";
  let closer = "";

  if (focusId === "skin_doctor") {
    opening = `If you are searching for a genuine, experienced skin doctor in Kota, ${clinic} is the best place to go.`;
    focusSentence = `Dr. Ashima Madan is an excellent skin doctor who takes the time to explain the root cause and treatments patiently.`;
    closer = `Definitely the most trusted skin doctor and clinic in Kota. 5 stars!`;
  } else if (focusId === "cosmetologist") {
    opening = `Visited ${clinic} in Kota and I am genuinely impressed with the aesthetic results.`;
    focusSentence = `Dr. Ashima Madan is a highly knowledgeable medical cosmetologist with great precision in aesthetic and laser treatments.`;
    closer = `Top recommendation for anyone looking for a certified medical cosmetologist in Kota!`;
  } else if (focusId === "skincare_clinic") {
    opening = `Easily the cleanest, most modern, and reliable skincare clinic in Kota.`;
    focusSentence = `Skinssence Skincare Clinic offers state-of-the-art laser technology and caring service under Dr. Ashima Madan.`;
    closer = `The staff is lovely and results speak for themselves. Best skincare clinic in Kota!`;
  } else {
    // Default: Dr. Ashima Madan
    opening = `Had a wonderful experience at ${clinic} in Kota!`;
    focusSentence = `Dr. Ashima Madan is very patient, thoroughly analyzed my skin, and recommended honest treatments without unnecessary procedures.`;
    closer = `Definitely one of the best skin specialists and laser clinics in Kota. Highly recommended!`;
  }

  // 4. Treatments detail (Handles 0, 1, or MULTIPLE treatments naturally)
  let treatmentPart = "";
  const selectedTreatmentsArray = TREATMENTS.filter(t => treatmentIds.includes(t.id));

  if (selectedTreatmentsArray.length > 0) {
    const treatmentNames = selectedTreatmentsArray
      .filter(t => t.id !== "other_procedure")
      .map(t => t.label);

    if (treatmentNames.length > 0) {
      const joinedNames = treatmentNames.length === 1 
        ? treatmentNames[0] 
        : treatmentNames.slice(0, -1).join(", ") + " and " + treatmentNames[treatmentNames.length - 1];
      
      treatmentPart = `I visited for ${joinedNames}. `;

      // Add specific experiential detail
      if (treatmentIds.includes("laser_hair")) {
        treatmentPart += "The laser session was virtually painless and carried out with great comfort. ";
      }
      if (treatmentIds.includes("hydrafacial")) {
        treatmentPart += "My skin felt deeply cleansed, hydrated, and glowing right after the HydraFacial. ";
      }
      if (treatmentIds.includes("acne_scars")) {
        treatmentPart += "Noticeable improvement in my skin texture and scars even after the initial session. ";
      }
      if (treatmentIds.includes("brightening")) {
        treatmentPart += "The peel gave my face an instant radiant glow without any irritation. ";
      }
      if (treatmentIds.includes("pigmentation")) {
        treatmentPart += "Seeing visible lightening of dark spots and pigmentation. ";
      }
      if (treatmentIds.includes("hair_prp")) {
        treatmentPart += "The PRP procedure was done very gently with clear aftercare steps. ";
      }
    } else if (treatmentIds.includes("other_procedure")) {
      treatmentPart = "The clinical procedure was carried out with extreme care and precision. ";
    }
  }

  // 5. Highlights (Multiple highlights naturally merged)
  let highlightPhrases = [];
  if (highlightsList.includes("hygiene")) {
    highlightPhrases.push("The clinic is spotlessly clean and maintains high hygiene standards.");
  }
  if (highlightsList.includes("doctor_expert")) {
    highlightPhrases.push("Doctor explained every step of the procedure patiently.");
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
    highlightPhrases.push("The staff is very polite and the clinic is equipped with the latest technology.");
  }

  const highlightSentence = highlightPhrases.slice(0, 2).join(" ");

  // 6. Custom note if any (Patients can mention any custom procedure here!)
  let customPart = "";
  if (customNote && customNote.trim()) {
    customPart = ` Also appreciated that ${customNote.trim().replace(/\.$/, "")}.`;
  }

  return `${locationHook}${opening} ${durationHook ? durationHook + 'and ' : ''}${focusSentence} ${treatmentPart}${highlightSentence}.${customPart} ${closer}`.replace(/\s+/g, " ").trim();
}

// Generate the single review
function generateReviewAction() {
  if (state.rating < 4) return;
  const treatmentsArray = Array.from(state.selectedTreatments);
  const highlightsArray = Array.from(state.selectedHighlights);
  
  const text = buildSingleBestReview(
    treatmentsArray,
    highlightsArray,
    state.selectedFocus,
    state.selectedLocation,
    state.selectedDuration,
    state.customNote,
    state.config.clinicName
  );

  state.currentReviewText = text;
  const textarea = document.getElementById("activeReviewTextarea");
  if (textarea) textarea.value = text;
}

// UI Rendering: Treatments with MULTI-SELECT support
function renderTreatments() {
  const container = document.getElementById("treatmentChips");
  if (!container) return;
  container.innerHTML = TREATMENTS.map(t => {
    const isSelected = state.selectedTreatments.has(t.id);
    return `
      <button type="button" 
        onclick="toggleTreatment('${t.id}')"
        class="px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between ${
          isSelected 
            ? 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500/30 font-semibold' 
            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
        }">
        <span class="truncate">${t.label}</span>
        ${isSelected ? '<span class="text-rose-600 font-bold ml-1 text-xs">✓</span>' : ''}
      </button>
    `;
  }).join("");
}

window.toggleTreatment = function(id) {
  if (state.selectedTreatments.has(id)) {
    state.selectedTreatments.delete(id);
  } else {
    state.selectedTreatments.add(id);
  }
  renderTreatments();
  generateReviewAction();
};

// UI Rendering: Highlights with MULTI-SELECT support
function renderHighlights() {
  const container = document.getElementById("highlightChips");
  if (!container) return;
  container.innerHTML = HIGHLIGHTS.map(h => {
    const isSelected = state.selectedHighlights.has(h.id);
    return `
      <button type="button" 
        onclick="toggleHighlight('${h.id}')"
        class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
          isSelected 
            ? 'bg-stone-900 border-stone-900 text-white shadow-xs font-semibold' 
            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
        }">
        <span>${h.label}</span>
        ${isSelected ? '<span class="text-emerald-400 font-bold text-[10px]">✓</span>' : ''}
      </button>
    `;
  }).join("");
}

window.toggleHighlight = function(id) {
  if (state.selectedHighlights.has(id)) {
    state.selectedHighlights.delete(id);
  } else {
    state.selectedHighlights.add(id);
  }
  renderHighlights();
  generateReviewAction();
};

// Doctor & Focus Chips
function renderDoctorChips() {
  const container = document.getElementById("doctorChips");
  if (!container) return;
  container.innerHTML = DOCTOR_FOCUS_OPTIONS.map(opt => {
    const isSelected = state.selectedFocus === opt.id;
    return `
      <button type="button" 
        onclick="selectDoctorFocus('${opt.id}')"
        class="px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
          isSelected 
            ? 'bg-rose-600 border-rose-600 text-white shadow-xs font-semibold' 
            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
        }">
        ${opt.label}
      </button>
    `;
  }).join("");
}

window.selectDoctorFocus = function(id) {
  state.selectedFocus = id;
  renderDoctorChips();
  generateReviewAction();
};

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

  // Star Rating Gating: Bottom button is ALWAYS VISIBLE and ALWAYS SAYS "Submit"
  const positiveSection = document.getElementById("positiveReviewSection");
  const privateFeedbackSection = document.getElementById("privateFeedbackSection");
  
  if (state.rating >= 4) {
    if (positiveSection) positiveSection.classList.remove("hidden");
    if (privateFeedbackSection) privateFeedbackSection.classList.add("hidden");
  } else {
    if (positiveSection) positiveSection.classList.add("hidden");
    if (privateFeedbackSection) privateFeedbackSection.classList.remove("hidden");
  }
}

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

// UNIFIED SUBMIT HANDLER:
// Button always says "Submit" and never changes appearance!
window.handleUniversalSubmit = async function() {
  if (state.rating >= 4) {
    await copyAndOpenGoogleReview();
  } else {
    await submitPrivateFeedback();
  }
};

async function copyAndOpenGoogleReview() {
  const editor = document.getElementById("activeReviewTextarea");
  const reviewText = editor ? editor.value : state.currentReviewText;

  if (!reviewText) {
    showToast("Please wait a moment...");
    return;
  }

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

  if (window.confetti) {
    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  }

  showToast("Review copied! Opening Google...");

  setTimeout(() => {
    const targetUrl = state.config.googleReviewUrl || "https://search.google.com";
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }, 450);
}

async function submitPrivateFeedback() {
  const message = document.getElementById("privateFeedbackText")?.value || "";
  const contact = document.getElementById("privateFeedbackContact")?.value || "";
  
  const selectedTreatmentsArray = Array.from(state.selectedTreatments)
    .map(id => TREATMENTS.find(t => t.id === id)?.label)
    .filter(Boolean);
  const treatmentSummary = selectedTreatmentsArray.length > 0 ? selectedTreatmentsArray.join(", ") : "General";

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
        treatment: treatmentSummary,
        message: message.trim(),
        contact: contact.trim() || "Not provided"
      })
    });
  } catch (err) {}

  const feedbackMsg = document.getElementById("privateFeedbackSuccess");
  if (feedbackMsg) feedbackMsg.classList.remove("hidden");

  const waNumber = state.config.directorWhatsApp || "919876543210";
  const waBtn = document.getElementById("privateFeedbackWhatsAppBtn");
  if (waBtn) {
    const textMsg = encodeURIComponent(`Hello Dr. Ashima, I visited Skinssence today for ${treatmentSummary} and had some concerns: "${message.trim()}" (Contact: ${contact})`);
    waBtn.href = `https://wa.me/${waNumber}?text=${textMsg}`;
    waBtn.classList.remove("hidden");
  }

  showToast("Thank you. Our Director will review this personally.");
}

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
