// Skinssence Laser & Skincare Clinic - Patient Feedback & SEO Review Engine

// Default Clinic Configurations
const DEFAULT_CONFIG = {
  clinicName: "Skinssence Laser and Skincare Clinic",
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJExamplePlaceID",
  doctorNames: ["Dr. Pooja", "Lead Dermatologist", "Senior Laser Specialist"],
  locationKeywords: "best laser clinic Kota, dermatologist near me, skin specialist Hadoti",
  geminiApiKey: ""
};

// Treatment Options with Icons and SEO Tags
const TREATMENTS = [
  { id: "laser_hair", label: "Laser Hair Reduction", icon: "✨", tag: "painless laser hair reduction" },
  { id: "hydrafacial", label: "HydraFacial / Medi-Facial", icon: "💧", tag: "HydraFacial glow treatment" },
  { id: "acne_scars", label: "Acne & Scar Treatment", icon: "🎯", tag: "acne scar removal and skin texture" },
  { id: "brightening", label: "Skin Brightening & Peels", icon: "🌟", tag: "chemical peel and skin brightening" },
  { id: "anti_aging", label: "Anti-Aging & Botox/Fillers", icon: "⏳", tag: "anti-aging treatment and rejuvenation" },
  { id: "pigmentation", label: "Pigmentation & Melasma", icon: "🪄", tag: "pigmentation and dark spot removal" },
  { id: "hair_prp", label: "Hair Restoration / PRP", icon: "🌿", tag: "PRP hair therapy" },
  { id: "consultation", label: "Dermatologist Consultation", icon: "🩺", tag: "expert skin consultation" }
];

// Highlight Chips
const HIGHLIGHTS = [
  { id: "painless", label: "Quick & Painless", icon: "⚡" },
  { id: "visible_glow", label: "Immediate Visible Glow", icon: "💎" },
  { id: "doctor_expert", label: "Doctor's In-Depth Consultation", icon: "👨‍⚕️" },
  { id: "hygiene", label: "Ultra Clean & Modern Clinic", icon: "🧼" },
  { id: "friendly_staff", label: "Caring & Helpful Staff", icon: "🤗" },
  { id: "clear_aftercare", label: "Clear Post-Care Instructions", icon: "📋" },
  { id: "punctual", label: "Zero Waiting / On-Time", icon: "⏱️" },
  { id: "genuine_pricing", label: "Honest & Transparent Advice", icon: "🤝" }
];

// Regional Cities / Localities for Local SEO Power
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
  { id: "chronic", label: "Chronic (3+ years)", text: "for a long time (over 3 years)" }
];

// App State
let state = {
  selectedTreatment: null,
  selectedHighlights: new Set(),
  selectedDoctor: "",
  selectedLocation: null,
  selectedDuration: null,
  customNote: "",
  rating: 5,
  activeReviewIndex: 0,
  generatedReviews: [],
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

  // Also sync live config from server API (Instant OTA updates!)
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const serverCfg = await res.json();
      state.config = { ...state.config, ...serverCfg };
      
      // Update treatments and locations dynamically if configured on server
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
    console.log("Running in offline/static mode with local config.");
  }
}

function saveConfig(newConfig) {
  state.config = { ...state.config, ...newConfig };
  localStorage.setItem("skinssence_config", JSON.stringify(state.config));
  updateUIBranding();
}

// Built-in High-Entropy Humanized AI Review Engine
// Incorporates Treatment, Doctor, Highlights, Regional Location SEO, Duration, and Custom Notes
function generateLocalReviews(treatmentObj, highlightsList, doctor, rating, locationObj, durationObj, customNote, clinicName) {
  const treatmentName = treatmentObj ? treatmentObj.label : "treatment";
  const treatmentTag = treatmentObj ? treatmentObj.tag : "skin treatment";
  const docMention = doctor ? `${doctor} and the team` : "the doctor and team";
  const docAlt = doctor ? `${doctor}` : "the dermatologist";

  // Location phrasing (Huge for local SEO rankings in Hadoti region!)
  let locationLead1 = "";
  let locationLead2 = "";
  let locationLead3 = "";

  if (locationObj) {
    if (locationObj.isLocal) {
      locationLead1 = `Living in ${locationObj.label}, `;
      locationLead2 = `Easily the best aesthetic and skin clinic in ${locationObj.label}! `;
      locationLead3 = `So glad to have a world-class clinic right here in ${locationObj.label}. `;
    } else {
      locationLead1 = `I traveled all the way from ${locationObj.label} to visit ${clinicName} in Kota, and it was 100% worth the journey! `;
      locationLead2 = `Came from ${locationObj.label} specifically for my ${treatmentName}. `;
      locationLead3 = `Being from ${locationObj.label}, finding a reputable laser & skin clinic was tough until I discovered ${clinicName} in Kota. `;
    }
  }

  // Duration phrasing
  let durationPhrase = "";
  if (durationObj) {
    durationPhrase = `I had been struggling with this concern ${durationObj.text}, `;
  }

  // Variation Pools for Maximum Authenticity
  const intros1 = [
    `${locationLead1}Had such a wonderful experience at ${clinicName}!`,
    `Honestly so pleased with my visit to ${clinicName}. ${locationLead1}`,
    `I was a little nervous before booking my ${treatmentName}, but ${clinicName} exceeded all expectations. ${locationLead2}`,
    `Cannot recommend ${clinicName} enough! ${locationLead1}`
  ];

  const intros2 = [
    `${locationLead2}If you're searching for the best clinic for ${treatmentTag}, ${clinicName} is top-tier.`,
    `Visited ${clinicName} for ${treatmentName} and I am genuinely impressed with their clinical standards. ${locationLead2}`,
    `I've visited several skin clinics across the region before, but ${clinicName} stands out in every aspect. ${locationLead1}`
  ];

  const intros3 = [
    `Super smooth experience at ${clinicName} for ${treatmentName}! ${locationLead3}`,
    `5-star service at ${clinicName}! ${locationLead2}`,
    `Loved my ${treatmentName} session at ${clinicName}. ${locationLead1}`
  ];

  // Treatment experiences
  const treatmentPhrases = {
    laser_hair: "The laser technology is truly advanced and virtually painless. Everything was done with so much precision and comfort.",
    hydrafacial: "My skin felt instantly hydrated, deeply cleansed, and visibly glowing right after the session. Best facial experience ever.",
    acne_scars: "Noticeable improvement in my skin texture and acne scars even after the initial session. The targeted approach really works.",
    brightening: "The peel gave my skin a fresh, radiant look without any harsh irritation. Exactly what my dull skin needed.",
    anti_aging: "The results look completely natural and refreshed. So much attention to detail and subtle artistry.",
    pigmentation: "Seeing significant lightening of dark spots and pigmentation. The treatment protocol was tailored specifically to my skin type.",
    hair_prp: "Very comfortable procedure with clear post-care instructions. Seeing positive progress and increased density.",
    consultation: "The doctor spent thorough time analyzing my skin concerns without pushing unnecessary products or packages."
  };

  const defaultTreatmentExp = `The ${treatmentName} was carried out so gently and professionally with noticeable results right away.`;
  const selectedExp = (treatmentObj && treatmentPhrases[treatmentObj.id]) || defaultTreatmentExp;

  // Highlights incorporation
  let highlightPhrases = [];
  if (highlightsList.includes("hygiene")) {
    highlightPhrases.push("The clinic is spotlessly clean, modern, and maintains the highest hygiene protocols.");
  }
  if (highlightsList.includes("doctor_expert")) {
    highlightPhrases.push(`${docAlt} took the time to explain the entire procedure patiently and answered all my questions.`);
  }
  if (highlightsList.includes("friendly_staff")) {
    highlightPhrases.push("The staff at reception and inside the procedure room are exceptionally courteous and welcoming.");
  }
  if (highlightsList.includes("punctual")) {
    highlightPhrases.push("Appointment started right on time with zero unnecessary waiting.");
  }
  if (highlightsList.includes("visible_glow")) {
    highlightPhrases.push("Loved the immediate visible glow and post-treatment results.");
  }
  if (highlightPhrases.length === 0) {
    highlightPhrases.push("From consultation to post-treatment care, the experience was seamless and reassuring.");
  }

  const highlightSentence = highlightPhrases.slice(0, 2).join(" ");

  // Custom patient note if provided
  let customSentence = "";
  if (customNote && customNote.trim()) {
    customSentence = `Also really appreciated that ${customNote.trim().replace(/\.$/, "")}. `;
  }

  // Closers
  const closers1 = [
    `Already looking forward to my follow-up session. Highly recommended to anyone caring for their skin!`,
    `Really happy with the results. If you want genuine skin care and visible results, definitely visit them.`,
    `So glad I found this clinic! Thank you to ${docMention} for the wonderful care.`
  ];

  const closers2 = [
    `One of the cleanest and most professional aesthetic clinics in Rajasthan. 10/10 recommendation!`,
    `Great technology, transparent consultation, and real visible outcomes. Will definitely be a regular here.`,
    `Hands down the best place for ${treatmentTag} and aesthetic dermatology.`
  ];

  const closers3 = [
    `Staff is lovely and results speak for themselves. Highly recommended!`,
    `Great hygiene, prompt service, and visible difference in my skin. 5/5!`,
    `Super happy with the outcome! Will be returning for sure.`
  ];

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Construct 3 distinct reviews
  const review1 = `${pickRandom(intros1)} ${durationPhrase ? durationPhrase + 'and ' : ''}I came in for ${treatmentName}. ${selectedExp} ${highlightSentence} ${customSentence}${pickRandom(closers1)}`;
  const review2 = `${pickRandom(intros2)} ${docAlt} provided an in-depth diagnosis before starting the ${treatmentName}. ${durationPhrase ? 'After dealing with this ' + durationObj.text + ', ' : ''}${selectedExp} ${highlightSentence} ${customSentence}${pickRandom(closers2)}`;
  const review3 = `${pickRandom(intros3)} ${selectedExp.split('.')[0]}. ${highlightPhrases[0] || 'Super clean setup and warm staff.'} ${customSentence}${pickRandom(closers3)}`;

  return [
    {
      title: "Warm & Genuine",
      badge: "⭐ Most Natural",
      desc: "Authentic, relatable patient story that builds high trust.",
      text: review1
    },
    {
      title: "Regional SEO & High-Impact",
      badge: "🚀 Best for Google Maps",
      desc: "Packed with strategic location & clinic keywords for top ranking.",
      text: review2
    },
    {
      title: "Quick & Direct",
      badge: "⚡ Short & Sweet",
      desc: "Crisp and concise for fast submission.",
      text: review3
    }
  ];
}

// API Generator (calls server proxy or direct Gemini if configured)
async function generateGeminiReviews(treatmentObj, highlightsList, doctor, rating, locationObj, durationObj, customNote, config) {
  if (!config.geminiApiKey) {
    return generateLocalReviews(treatmentObj, highlightsList, doctor, rating, locationObj, durationObj, customNote, config.clinicName);
  }

  try {
    const res = await fetch("/api/generate-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        treatment: treatmentObj ? treatmentObj.label : "Skin Treatment",
        highlights: highlightsList,
        doctorName: doctor,
        rating: rating,
        clinicName: config.clinicName,
        locationKeywords: config.locationKeywords,
        patientCity: locationObj ? locationObj.label : "",
        concernDuration: durationObj ? durationObj.label : "",
        customNote: customNote || "",
        apiKey: config.geminiApiKey
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reviews && data.reviews.length >= 3) {
        return data.reviews.map((r, i) => ({
          title: r.title || (i === 0 ? "Warm & Genuine" : i === 1 ? "Regional SEO & High-Impact" : "Quick & Direct"),
          badge: r.badge || (i === 0 ? "⭐ Most Natural" : i === 1 ? "🚀 Best for Google Maps" : "⚡ Short & Sweet"),
          desc: i === 0 ? "Authentic personal patient story." : i === 1 ? "Optimized with location and doctor keywords." : "Short and crisp.",
          text: r.text
        }));
      }
    }
  } catch (err) {
    console.warn("Backend Gemini endpoint unavailable, falling back to smart local engine:", err);
  }

  return generateLocalReviews(treatmentObj, highlightsList, doctor, rating, locationObj, durationObj, customNote, config.clinicName);
}

// UI Rendering Functions
function renderTreatments() {
  const container = document.getElementById("treatmentChips");
  if (!container) return;
  container.innerHTML = TREATMENTS.map(t => {
    const isSelected = state.selectedTreatment && state.selectedTreatment.id === t.id;
    return `
      <button type="button" 
        onclick="selectTreatment('${t.id}')"
        class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${
          isSelected 
            ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20 shadow-sm' 
            : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300 hover:bg-stone-50'
        }">
        <span class="text-base">${t.icon}</span>
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
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
          isSelected 
            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm' 
            : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:bg-stone-50'
        }">
        <span>${h.icon}</span>
        <span>${h.label}</span>
      </button>
    `;
  }).join("");
}

function renderDoctorChips() {
  const container = document.getElementById("doctorChips");
  if (!container) return;
  const docs = state.config.doctorNames || [];
  container.innerHTML = docs.map(name => {
    const isSelected = state.selectedDoctor === name;
    return `
      <button type="button" 
        onclick="selectDoctor('${name}')"
        class="px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
          isSelected 
            ? 'bg-stone-900 border-stone-900 text-white shadow-sm' 
            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
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
            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-rose-300'
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
            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-300'
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
      <button type="button" onclick="setRating(${i})" class="p-1.5 transition-transform hover:scale-125 focus:outline-none" aria-label="${i} stars">
        <svg class="w-8 h-8 ${isFilled ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-stone-300 fill-transparent stroke-stone-300'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    `;
  }
  container.innerHTML = html;

  const ratingDesc = document.getElementById("ratingDescription");
  if (ratingDesc) {
    const descMap = {
      5: "🌟 Exceptional! (Recommended for Google)",
      4: "😊 Very Good Experience",
      3: "😐 Average (Let our Director help you)",
      2: "🙁 Below Expectations",
      1: "😞 Disappointed"
    };
    ratingDesc.innerText = descMap[state.rating] || "";
  }

  // Review Gating logic:
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

// User Actions
window.selectTreatment = function(id) {
  const found = TREATMENTS.find(t => t.id === id);
  if (state.selectedTreatment && state.selectedTreatment.id === id) {
    state.selectedTreatment = null;
  } else {
    state.selectedTreatment = found;
  }
  renderTreatments();
  triggerAutoGeneration();
};

window.toggleHighlight = function(id) {
  if (state.selectedHighlights.has(id)) {
    state.selectedHighlights.delete(id);
  } else {
    state.selectedHighlights.add(id);
  }
  renderHighlights();
  triggerAutoGeneration();
};

window.selectDoctor = function(name) {
  if (state.selectedDoctor === name) {
    state.selectedDoctor = "";
  } else {
    state.selectedDoctor = name;
  }
  renderDoctorChips();
  triggerAutoGeneration();
};

window.selectLocation = function(id) {
  const found = LOCATIONS.find(l => l.id === id);
  if (state.selectedLocation && state.selectedLocation.id === id) {
    state.selectedLocation = null;
  } else {
    state.selectedLocation = found;
  }
  renderLocations();
  triggerAutoGeneration();
};

window.selectDuration = function(id) {
  const found = DURATIONS.find(d => d.id === id);
  if (state.selectedDuration && state.selectedDuration.id === id) {
    state.selectedDuration = null;
  } else {
    state.selectedDuration = found;
  }
  renderDurations();
  triggerAutoGeneration();
};

window.handleCustomNoteInput = function(e) {
  state.customNote = e.target.value;
  triggerAutoGeneration();
};

window.setRating = function(r) {
  state.rating = r;
  renderStars();
  if (r >= 4) {
    triggerAutoGeneration();
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

let debounceTimer = null;
function triggerAutoGeneration() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    generateReviewsAction();
  }, 250);
}

// Trigger Review Generation
async function generateReviewsAction() {
  if (state.rating < 4) return;
  const list = Array.from(state.selectedHighlights);
  const loadingEl = document.getElementById("aiLoadingIndicator");
  const reviewsContainer = document.getElementById("reviewsCardsContainer");

  if (loadingEl) loadingEl.classList.remove("hidden");
  if (reviewsContainer) reviewsContainer.classList.add("opacity-50");

  try {
    const reviews = await generateGeminiReviews(
      state.selectedTreatment,
      list,
      state.selectedDoctor,
      state.rating,
      state.selectedLocation,
      state.selectedDuration,
      state.customNote,
      state.config
    );
    state.generatedReviews = reviews;
    state.activeReviewIndex = 0;
    renderReviewCards();
  } catch (e) {
    console.error(e);
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
    if (reviewsContainer) reviewsContainer.classList.remove("opacity-50");
  }
}

function renderReviewCards() {
  const container = document.getElementById("reviewsCardsContainer");
  if (!container || !state.generatedReviews.length) return;

  container.innerHTML = state.generatedReviews.map((rev, index) => {
    const isSelected = index === state.activeReviewIndex;
    return `
      <div onclick="selectReviewCard(${index})" 
        class="relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
          isSelected 
            ? 'border-rose-500 bg-gradient-to-br from-rose-50/70 to-white shadow-md ring-2 ring-rose-500/10' 
            : 'border-stone-200 bg-white hover:border-stone-300'
        }">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              index === 0 ? 'bg-amber-100 text-amber-800' : index === 1 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }">
              ${rev.badge}
            </span>
            <span class="text-xs font-medium text-stone-500">${rev.title}</span>
          </div>
          <div class="w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-stone-300'}">
            ${isSelected ? '<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>' : ''}
          </div>
        </div>

        <p class="text-stone-800 text-sm leading-relaxed" id="reviewText_${index}">${rev.text}</p>

        <div class="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
          <span>Tap to select or edit below</span>
          <span class="font-medium text-rose-600">Option ${index + 1} of 3</span>
        </div>
      </div>
    `;
  }).join("");

  updateSelectedReviewEditor();
}

window.selectReviewCard = function(index) {
  state.activeReviewIndex = index;
  renderReviewCards();
};

function updateSelectedReviewEditor() {
  const editor = document.getElementById("activeReviewTextarea");
  if (!editor || !state.generatedReviews[state.activeReviewIndex]) return;
  editor.value = state.generatedReviews[state.activeReviewIndex].text;
}

window.handleEditorChange = function(e) {
  if (state.generatedReviews[state.activeReviewIndex]) {
    state.generatedReviews[state.activeReviewIndex].text = e.target.value;
  }
};

// 1-Click Copy and Open Google Review Link
window.copyAndOpenGoogleReview = async function() {
  const currentReview = state.generatedReviews[state.activeReviewIndex];
  const editor = document.getElementById("activeReviewTextarea");
  const reviewText = editor ? editor.value : (currentReview ? currentReview.text : "");

  if (!reviewText) {
    showToast("Please select a treatment first!");
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
    window.confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 }
    });
  }

  // 3. Show instruction modal or toast
  showToast("📋 Review Copied! Opening Google Reviews...");

  // 4. Open Google Review URL after 500ms
  setTimeout(() => {
    const targetUrl = state.config.googleReviewUrl || "https://search.google.com";
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }, 500);
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

  // 1. Post to Server Admin Inbox
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
  } catch (err) {
    console.error("Failed to post feedback to server", err);
  }

  // 2. Reveal Success & WhatsApp shortcut
  const feedbackMsg = document.getElementById("privateFeedbackSuccess");
  if (feedbackMsg) feedbackMsg.classList.remove("hidden");
  
  const submitBtn = document.getElementById("privateFeedbackSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50");
  }

  // 3. Option to WhatsApp directly to Clinic Director
  const waNumber = state.config.directorWhatsApp || "919876543210";
  const waBtn = document.getElementById("privateFeedbackWhatsAppBtn");
  if (waBtn) {
    const textMsg = encodeURIComponent(`Hello Director, I visited Skinssence today for ${treatmentName} and had some concerns: "${message.trim()}" (Contact: ${contact})`);
    waBtn.href = `https://wa.me/${waNumber}?text=${textMsg}`;
    waBtn.classList.remove("hidden");
  }

  showToast("Thank you. Grievance recorded directly in Clinic Director's inbox.");
};

window.regenerateReviews = function() {
  generateReviewsAction();
};

function showToast(msg) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 bg-stone-900/95 text-white px-5 py-3 rounded-full text-xs font-medium shadow-2xl z-50 transition-all duration-300 pointer-events-none";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.remove("opacity-0", "translate-y-2");
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
  }, 3500);
}

function generateQRCode(elementId, url) {
  const container = document.getElementById(elementId);
  if (!container || !window.QRCode) return;
  container.innerHTML = "";
  new QRCode(container, {
    text: url,
    width: 180,
    height: 180,
    colorDark: "#1c1917",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function updateUIBranding() {
  const clinicHeaders = document.querySelectorAll(".clinic-brand-name");
  clinicHeaders.forEach(el => el.innerText = state.config.clinicName);
}

// Init on Load
document.addEventListener("DOMContentLoaded", () => {
  loadConfig();
  renderTreatments();
  renderHighlights();
  renderDoctorChips();
  renderLocations();
  renderDurations();
  renderStars();
  updateUIBranding();

  // Pre-select first treatment and highlights for instant zero-effort experience
  if (TREATMENTS.length > 0) {
    state.selectedTreatment = TREATMENTS[0];
    state.selectedHighlights.add("doctor_expert");
    state.selectedHighlights.add("hygiene");
    renderTreatments();
    renderHighlights();
    generateReviewsAction();
  }

  // QR Modal logic
  const qrModalBtn = document.getElementById("openQrModalBtn");
  if (qrModalBtn) {
    qrModalBtn.addEventListener("click", () => {
      const modal = document.getElementById("qrModal");
      if (modal) {
        modal.classList.remove("hidden");
        const currentUrl = window.location.href.split("#")[0];
        generateQRCode("modalQrCodeContainer", currentUrl);
        const urlInput = document.getElementById("qrUrlDisplay");
        if (urlInput) urlInput.value = currentUrl;
      }
    });
  }

  // Admin Modal logic
  const adminModal = document.getElementById("adminModal");
  const openAdminBtn = document.getElementById("openAdminModalBtn");
  const closeAdminBtn = document.getElementById("closeAdminModalBtn");
  const saveAdminBtn = document.getElementById("saveAdminConfigBtn");

  if (openAdminBtn) {
    openAdminBtn.addEventListener("click", () => {
      adminModal.classList.remove("hidden");
      document.getElementById("cfgClinicName").value = state.config.clinicName;
      document.getElementById("cfgGoogleUrl").value = state.config.googleReviewUrl;
      document.getElementById("cfgDoctors").value = (state.config.doctorNames || []).join(", ");
      document.getElementById("cfgKeywords").value = state.config.locationKeywords;
      document.getElementById("cfgGeminiKey").value = state.config.geminiApiKey || "";
    });
  }

  if (closeAdminBtn) {
    closeAdminBtn.addEventListener("click", () => {
      adminModal.classList.add("hidden");
    });
  }

  if (saveAdminBtn) {
    saveAdminBtn.addEventListener("click", () => {
      const docNames = document.getElementById("cfgDoctors").value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      saveConfig({
        clinicName: document.getElementById("cfgClinicName").value.trim() || DEFAULT_CONFIG.clinicName,
        googleReviewUrl: document.getElementById("cfgGoogleUrl").value.trim() || DEFAULT_CONFIG.googleReviewUrl,
        doctorNames: docNames,
        locationKeywords: document.getElementById("cfgKeywords").value.trim(),
        geminiApiKey: document.getElementById("cfgGeminiKey").value.trim()
      });

      renderDoctorChips();
      generateReviewsAction();
      adminModal.classList.add("hidden");
      showToast("Clinic settings saved!");
    });
  }
});
