// Skinssence Laser & Skincare Clinic - Patient Feedback & Review Engine
// Founder & Director: Dr. Ashima Madan

// Default Clinic Configurations
const DEFAULT_CONFIG = {
  clinicName: "Skinssence Laser and Skincare Clinic",
  googleReviewUrl: "https://g.page/r/CeJjh7hjuRReEBM/review",
  directorWhatsApp: "919509197578",
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
  variationIndex: 0,
  config: { ...DEFAULT_CONFIG }
};

// Clean out any legacy cached names or dummy links
function sanitizeConfig(cfg) {
  cfg.doctorNames = ["Dr. Ashima Madan", "Senior Skin Specialist"];
  if (cfg.locationKeywords && /dermatologist/i.test(cfg.locationKeywords)) {
    cfg.locationKeywords = cfg.locationKeywords.replace(/dermatologist/gi, "skin specialist");
  }
  if (!cfg.googleReviewUrl || cfg.googleReviewUrl.includes("ExamplePlaceID")) {
    cfg.googleReviewUrl = "https://g.page/r/CeJjh7hjuRReEBM/review";
  }
  if (!cfg.directorWhatsApp || cfg.directorWhatsApp.includes("9876543210") || cfg.directorWhatsApp.includes("9033512819")) {
    cfg.directorWhatsApp = "919509197578";
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
// Rotates through natural, authentic linguistic styles whenever user taps "Change wording"
function buildSingleBestReview(treatmentIds, highlightsList, focusId, locationObj, durationObj, customNote, clinicName, variantIndex = 0) {
  const clinic = clinicName || "Skinssence Laser and Skincare Clinic";
  const mod = Math.abs(variantIndex) % 4;

  // 1. Location Hook (Local SEO for Kota and surrounding districts)
  let locationHook = "";
  if (locationObj) {
    if (locationObj.isLocal) {
      const localHooks = [
        `Living in ${locationObj.label}, I am so glad we have such an advanced skin clinic here. `,
        `Being from ${locationObj.label}, choosing Skinssence was the best decision for my skin. `,
        `Conveniently located near ${locationObj.label}, and the clinical care is truly top tier. `,
        `I reside in ${locationObj.label} and Skinssence is undoubtedly our most trusted local clinic. `
      ];
      locationHook = localHooks[mod];
    } else {
      const travelHooks = [
        `I traveled from ${locationObj.label} to visit ${clinic} in Kota, and it was completely worth the journey! `,
        `Came all the way from ${locationObj.label} specifically for treatment at Skinssence, and the results exceeded my expectations. `,
        `Traveled from ${locationObj.label} to consult Dr. Ashima Madan in Kota. Highly satisfied! `,
        `Made the trip from ${locationObj.label} and the expertise here is well worth the travel. `
      ];
      locationHook = travelHooks[mod];
    }
  }

  // 2. Duration mention
  let durationHook = "";
  if (durationObj) {
    const durationHooks = [
      `I had been dealing with this skin issue ${durationObj.text}, `,
      `Having faced this concern ${durationObj.text}, `,
      `After struggling with this condition ${durationObj.text}, `,
      `I had this issue persistent ${durationObj.text}, `
    ];
    durationHook = durationHooks[mod];
  }

  // 3. Opening, Focus, and Closer variations based on chosen focus
  let opening = "";
  let focusSentence = "";
  let closer = "";

  if (focusId === "skin_doctor") {
    const openings = [
      `If you are searching for a genuine, experienced skin doctor in Kota, ${clinic} is the best place to go.`,
      `Skinssence is hands down the best skin doctor clinic in Kota.`,
      `Consulted Dr. Ashima Madan at ${clinic} after trying several other remedies.`,
      `Great experience with the skin doctor team at ${clinic}, Kota.`
    ];
    const focuses = [
      `Dr. Ashima Madan is an excellent skin doctor who takes the time to explain the root cause and treatments patiently.`,
      `Dr. Ashima Madan treats skin concerns with genuine medical expertise and customizes every solution according to your skin type.`,
      `As a senior skin doctor, her diagnosis was pinpoint accurate and the recommended treatment started showing visible improvements very quickly.`,
      `Dr. Ashima Madan is so reassuring and knowledgeable. She focuses on real long-term skin health with clear guidance.`
    ];
    const closers = [
      `Definitely the most trusted skin doctor and clinic in Kota. 5 stars!`,
      `Super happy with the noticeable results. Best skin doctor in the region!`,
      `Remarkable skin doctor with a very professional, friendly clinic.`,
      `If you need a reliable skin doctor in Kota, Skinssence is the place to visit!`
    ];
    opening = openings[mod];
    focusSentence = focuses[mod];
    closer = closers[mod];
  } else if (focusId === "cosmetologist") {
    const openings = [
      `Visited ${clinic} in Kota and I am genuinely impressed with the aesthetic results.`,
      `Had my aesthetic session at ${clinic} and the results speak for themselves.`,
      `If you are looking for safe, high-grade aesthetic treatments, Dr. Ashima Madan at ${clinic} is the ideal medical cosmetologist.`,
      `Skinssence is the gold standard for clinical cosmetology in Kota.`
    ];
    const focuses = [
      `Dr. Ashima Madan is a highly knowledgeable medical cosmetologist with great precision in aesthetic and laser treatments.`,
      `Dr. Ashima Madan is such a skilled medical cosmetologist. Her technique is gentle, subtle, and gives an authentic, natural enhancement.`,
      `The clinic uses modern US-FDA standard equipment and follows strict clinical protocols for every procedure.`,
      `Dr. Ashima's cosmetic expertise gave my skin a refined, clear, and glowing texture without any downtime.`
    ];
    const closers = [
      `Top recommendation for anyone looking for a certified medical cosmetologist in Kota!`,
      `Best medical cosmetology and aesthetic laser clinic in Kota!`,
      `Visible glow, flawless safety, and wonderful staff. Highly recommended!`,
      `Grateful to Dr. Ashima Madan and the entire team at Skinssence!`
    ];
    opening = openings[mod];
    focusSentence = focuses[mod];
    closer = closers[mod];
  } else if (focusId === "skincare_clinic") {
    const openings = [
      `Easily the cleanest, most modern, and reliable skincare clinic in Kota.`,
      `Skinssence Laser & Skincare Clinic is undoubtedly the most premium skincare centre in Kota.`,
      `I had a very soothing and rewarding experience at ${clinic}.`,
      `One of the best decisions to choose Skinssence Skincare Clinic for my treatment.`
    ];
    const focuses = [
      `Skinssence Skincare Clinic offers state-of-the-art laser technology and caring service under Dr. Ashima Madan.`,
      `The atmosphere is immaculate, hygiene standards are top-notch, and Dr. Ashima Madan provides expert clinical supervision.`,
      `Their skincare equipment is modern, the therapists are well-trained, and Dr. Ashima ensures personal care for every patient.`,
      `Very hygienic, modern clinic with a warm and welcoming environment led by Dr. Ashima Madan.`
    ];
    const closers = [
      `The staff is lovely and results speak for themselves. Best skincare clinic in Kota!`,
      `A 5-star clinic experience right here in Kota!`,
      `Superb clinic with honest guidance. Will definitely be regular here!`,
      `Highly satisfied with the outcomes and overall clinic service!`
    ];
    opening = openings[mod];
    focusSentence = focuses[mod];
    closer = closers[mod];
  } else {
    // Default: Dr. Ashima Madan
    const openings = [
      `Had a wonderful experience at ${clinic} in Kota!`,
      `I had an exceptional consultation with Dr. Ashima Madan at ${clinic}.`,
      `Finding a doctor who gives honest, transparent advice is rare, but Dr. Ashima Madan is wonderful.`,
      `Highly impressed with the quality of care at ${clinic}, Kota.`
    ];
    const focuses = [
      `Dr. Ashima Madan is very patient, thoroughly analyzed my skin, and recommended honest treatments without unnecessary procedures.`,
      `Her diagnostic approach is so thoughtful and scientific. She genuinely listens to your concerns and explains the exact skincare routine needed.`,
      `From the very first visit, she made me feel completely comfortable and guided me with the right clinical approach rather than pushing unnecessary treatments.`,
      `Dr. Ashima Madan is extremely skilled, warm, and attentive. The clinic ambience is calm and premium.`
    ];
    const closers = [
      `Definitely one of the best skin specialists and laser clinics in Kota. Highly recommended!`,
      `Truly grateful for her guidance. Skinssence is easily the top clinic for advanced skin care in Kota!`,
      `My skin feels so much healthier. Outstanding care and five-star service!`,
      `Would definitely recommend Dr. Ashima to anyone in Kota seeking genuine, result-oriented skincare!`
    ];
    opening = openings[mod];
    focusSentence = focuses[mod];
    closer = closers[mod];
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
      
      const intros = [
        `I visited for ${joinedNames}. `,
        `Came in specifically for ${joinedNames}. `,
        `Took their session for ${joinedNames}. `,
        `Opted for ${joinedNames} at the clinic. `
      ];
      treatmentPart = intros[mod];

      // Add specific experiential detail
      if (treatmentIds.includes("laser_hair")) {
        const laserPhrases = [
          "The laser session was virtually painless and carried out with great comfort. ",
          "The laser hair reduction procedure was extremely smooth and completely painless. ",
          "Laser sessions are done with cooling technology, so zero discomfort. ",
          "Very comfortable laser treatment with visible thinning after sessions. "
        ];
        treatmentPart += laserPhrases[mod];
      }
      if (treatmentIds.includes("hydrafacial")) {
        const facialPhrases = [
          "My skin felt deeply cleansed, hydrated, and glowing right after the HydraFacial. ",
          "Immediate radiant glow and refreshed feeling after the HydraFacial session. ",
          "Skin texture felt super soft and hydrated, totally loved the facial. ",
          "Instant hydration and clean glow without any redness. "
        ];
        treatmentPart += facialPhrases[mod];
      }
      if (treatmentIds.includes("acne_scars")) {
        const acnePhrases = [
          "Noticeable improvement in my skin texture and scars even after the initial session. ",
          "Active breakouts reduced significantly and scars are softening visibly. ",
          "Very targeted acne treatment with genuine visible healing. ",
          "My skin texture is noticeably clearer and smoother. "
        ];
        treatmentPart += acnePhrases[mod];
      }
      if (treatmentIds.includes("brightening")) {
        const peelPhrases = [
          "The peel gave my face an instant radiant glow without any irritation. ",
          "Gentle chemical peel with immediate brightening effect and no downtime. ",
          "Face felt refreshed and brighter within days of the session. ",
          "Remarkable improvement in even skin tone and natural glow. "
        ];
        treatmentPart += peelPhrases[mod];
      }
      if (treatmentIds.includes("pigmentation")) {
        const pigmPhrases = [
          "Seeing visible lightening of dark spots and pigmentation. ",
          "Dark patches and sun spots have lightened up considerably. ",
          "Effective clinical treatment that significantly reduced my stubborn pigmentation. ",
          "Skin looks much more even-toned with faded blemishes. "
        ];
        treatmentPart += pigmPhrases[mod];
      }
      if (treatmentIds.includes("hair_prp")) {
        const prpPhrases = [
          "The PRP procedure was done very gently with clear aftercare steps. ",
          "Hair fall has visibly controlled and the PRP session was handled very professionally. ",
          "Smooth PRP procedure with minimal discomfort and great aftercare support. ",
          "Very structured hair restoration therapy with encouraging density improvement. "
        ];
        treatmentPart += prpPhrases[mod];
      }
    } else if (treatmentIds.includes("other_procedure")) {
      const otherPhrases = [
        "The clinical procedure was carried out with extreme care and precision. ",
        "The procedure was handled with complete professionalism and utmost hygiene. ",
        "Every step of the treatment was explained beforehand and conducted smoothly. ",
        "Very satisfied with how delicately and effectively the procedure was performed. "
      ];
      treatmentPart = otherPhrases[mod];
    }
  }

  // 5. Highlights (Multiple highlights naturally merged)
  let highlightPhrases = [];
  if (highlightsList.includes("hygiene")) {
    const hg = [
      "The clinic is spotlessly clean and maintains high hygiene standards.",
      "Super hygienic environment with sterilized equipment.",
      "Impeccable cleanliness and a very reassuring, sanitized setup.",
      "The clinic maintains hospital-grade sanitization."
    ];
    highlightPhrases.push(hg[mod]);
  }
  if (highlightsList.includes("doctor_expert")) {
    const exp = [
      "Doctor explained every step of the procedure patiently.",
      "Doctor answered all my questions with genuine patience.",
      "Appreciated how thoroughly the doctor explained the treatment plan.",
      "Very transparent consultation without rushing."
    ];
    highlightPhrases.push(exp[mod]);
  }
  if (highlightsList.includes("friendly_staff")) {
    const stf = [
      "The staff is polite, courteous, and very helpful.",
      "Warm and welcoming staff who take care of every detail.",
      "Support staff is extremely cooperative and well-mannered.",
      "Caring team that makes you feel relaxed right from entry."
    ];
    highlightPhrases.push(stf[mod]);
  }
  if (highlightsList.includes("painless")) {
    const pnl = [
      "The entire procedure was quick, smooth, and painless.",
      "Zero pain and very gentle handling throughout.",
      "Very comfortable session with no discomfort at all.",
      "Quick and completely painless process."
    ];
    highlightPhrases.push(pnl[mod]);
  }
  if (highlightsList.includes("visible_glow")) {
    const glw = [
      "Loved the immediate visible glow and post-treatment results.",
      "Noticed an instant healthy glow right after the visit.",
      "Visible results that make the visit totally worth it.",
      "Skin looked visibly radiant and healthy."
    ];
    highlightPhrases.push(glw[mod]);
  }
  if (highlightsList.includes("punctual")) {
    const pnc = [
      "Zero waiting time and punctual appointments.",
      "Appreciated the on-time appointment management.",
      "Very punctual and well-organized scheduling.",
      "No long waiting queues, very smooth scheduling."
    ];
    highlightPhrases.push(pnc[mod]);
  }
  if (highlightPhrases.length === 0) {
    const dflt = [
      "The staff is very polite and the clinic is equipped with the latest technology.",
      "Modern clinic setup with very polite and accommodating staff.",
      "High-tech equipment and a very professional atmosphere.",
      "Calm, soothing clinic environment with courteous staff."
    ];
    highlightPhrases.push(dflt[mod]);
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
    state.config.clinicName,
    state.variationIndex
  );

  state.currentReviewText = text;
  const textarea = document.getElementById("activeReviewTextarea");
  if (textarea) {
    textarea.value = text;
    // Visual indicator that new wording has loaded
    textarea.classList.add("ring-2", "ring-rose-400", "bg-rose-50/40");
    setTimeout(() => {
      textarea.classList.remove("ring-2", "ring-rose-400", "bg-rose-50/40");
    }, 350);
  }
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
  state.variationIndex++;
  generateReviewAction();
  showToast("Wording updated!");
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
    let targetUrl = state.config.googleReviewUrl;
    if (!targetUrl || targetUrl.includes("ExamplePlaceID")) {
      targetUrl = "https://g.page/r/CeJjh7hjuRReEBM/review";
    }
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
