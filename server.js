const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Locate public folder flexibly (whether at root, in cwd, or subfolder)
const possiblePublicDirs = [
  path.join(__dirname, 'public'),
  path.join(process.cwd(), 'public'),
  path.join(__dirname, 'skinssence-feedback', 'public'),
  path.join(process.cwd(), 'skinssence-feedback', 'public'),
  __dirname
];

let publicDir = path.join(__dirname, 'public');
for (const dir of possiblePublicDirs) {
  if (fs.existsSync(path.join(dir, 'index.html'))) {
    publicDir = dir;
    console.log('Serving static files from:', publicDir);
    break;
  }
}

app.use(express.static(publicDir));

// Explicit route handlers
app.get('/', (req, res) => {
  const file = path.join(publicDir, 'index.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send(`
    <h2>Skinssence Review Server is Active!</h2>
    <p>However, <b>index.html</b> was not found in the <code>public/</code> folder on your repository.</p>
    <p>Please make sure you uploaded the <code>public</code> folder containing <code>index.html</code>, <code>admin.html</code>, <code>standee.html</code>, and <code>app.js</code>.</p>
    <p>Current directory files: ${fs.readdirSync(__dirname).join(', ')}</p>
  `);
});

app.get('/admin', (req, res) => {
  const file = path.join(publicDir, 'admin.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.redirect('/admin.html');
});

app.get('/standee', (req, res) => {
  const file = path.join(publicDir, 'standee.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.redirect('/standee.html');
});

// Ensure data folder exists (works on both standard servers and serverless like Vercel)
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Note on DATA_DIR creation:', e.message);
}

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedbacks.json');

// Default Clinic Configurations
const DEFAULT_CONFIG = {
  clinicName: "Skinssence Laser and Skincare Clinic",
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJExamplePlaceID",
  directorWhatsApp: "919876543210", // Clinic Director's WhatsApp for instant 1-3 star complaint alerts
  directorEmail: "director@skinssence.com",
  doctorNames: ["Dr. Pooja", "Lead Dermatologist", "Senior Laser Specialist"],
  locationKeywords: "best laser clinic Kota, dermatologist near me, skin specialist Hadoti",
  treatments: [
    { id: "laser_hair", label: "Laser Hair Reduction", icon: "✨", tag: "painless laser hair reduction" },
    { id: "hydrafacial", label: "HydraFacial / Medi-Facial", icon: "💧", tag: "HydraFacial glow treatment" },
    { id: "acne_scars", label: "Acne & Scar Treatment", icon: "🎯", tag: "acne scar removal and skin texture" },
    { id: "brightening", label: "Skin Brightening & Peels", icon: "🌟", tag: "chemical peel and skin brightening" },
    { id: "anti_aging", label: "Anti-Aging & Botox/Fillers", icon: "⏳", tag: "anti-aging treatment and rejuvenation" },
    { id: "pigmentation", label: "Pigmentation & Melasma", icon: "🪄", tag: "pigmentation and dark spot removal" },
    { id: "hair_prp", label: "Hair Restoration / PRP", icon: "🌿", tag: "PRP hair therapy" },
    { id: "consultation", label: "Dermatologist Consultation", icon: "🩺", tag: "expert skin consultation" }
  ],
  locations: [
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
  ],
  geminiApiKey: ""
};

// Initialize config file if not exists
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

// Initialize feedback file if not exists
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2));
}

// 1. Get Clinic Configurations
app.get('/api/config', (req, res) => {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.json(DEFAULT_CONFIG);
  }
});

// 2. Update Clinic Configurations (Fine Control Panel)
app.post('/api/config', (req, res) => {
  try {
    const newConfig = { ...DEFAULT_CONFIG, ...req.body };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    res.json({ success: true, config: newConfig });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save config', details: err.message });
  }
});

// 3. Save Private Feedback (1, 2, or 3 Stars - Grievance Shield)
app.post('/api/feedback', (req, res) => {
  try {
    const { rating, treatment, message, contact, patientName } = req.body;
    let feedbacks = [];
    if (fs.existsSync(FEEDBACK_FILE)) {
      feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8') || '[]');
    }

    const newFeedback = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      rating: rating || 2,
      treatment: treatment || 'Not specified',
      patientName: patientName || 'Anonymous',
      contact: contact || 'Not provided',
      message: message || '',
      status: 'NEW' // NEW, CONTACTED, RESOLVED
    };

    feedbacks.unshift(newFeedback);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));

    res.json({ success: true, feedback: newFeedback });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record feedback', details: err.message });
  }
});

// 4. Get All Private Feedbacks (Admin Inbox)
app.get('/api/feedback', (req, res) => {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
      return res.json(JSON.parse(data || '[]'));
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load feedbacks' });
  }
});

// 5. Update Feedback Status (Resolve / Contacted)
app.patch('/api/feedback/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8') || '[]');
    const index = feedbacks.findIndex(f => f.id === id);
    if (index !== -1) {
      feedbacks[index].status = status;
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));
      return res.json({ success: true, feedback: feedbacks[index] });
    }
    res.status(404).json({ error: 'Feedback not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

// 6. Gemini AI Proxy Endpoint
app.post('/api/generate-review', async (req, res) => {
  const { 
    treatment, 
    highlights, 
    rating, 
    doctorName, 
    clinicName, 
    locationKeywords, 
    patientCity, 
    concernDuration, 
    customNote, 
    apiKey 
  } = req.body;

  let currentConfig = DEFAULT_CONFIG;
  try {
    currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {}

  const activeKey = apiKey || currentConfig.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    return res.status(400).json({ error: 'No Gemini API key provided. Using built-in high-entropy AI generator.' });
  }

  try {
    const prompt = `You are a genuine, happy patient who just had a treatment at "${clinicName || 'Skinssence Laser and Skincare Clinic'} in Kota".
Write 3 completely natural, humanized, authentic Google Reviews based on these details:
- Treatment: ${treatment || 'Skin Treatment'}
- Highlights experienced: ${highlights && highlights.length ? highlights.join(', ') : 'Great results, hygienic clinic, caring doctor'}
- Rating: ${rating || 5} out of 5 stars
${patientCity ? `- Patient's Location/City: ${patientCity} (Weave naturally into review, e.g. 'I traveled from ${patientCity}...' or 'Living in ${patientCity}, this is the best clinic...')` : ''}
${concernDuration ? `- Duration of skin concern: ${concernDuration} (e.g. 'I had been dealing with this for ${concernDuration}...')` : ''}
${customNote ? `- Specific patient note to include: "${customNote}"` : ''}
${doctorName ? `- Doctor/Therapist mentioned: ${doctorName}` : ''}
${locationKeywords ? `- Regional keywords: ${locationKeywords}` : ''}

CRITICAL RULES FOR GOOGLE SEO & NATURAL HUMAN TONE:
1. Do NOT sound like an AI, marketing brochure, or corporate ad. Use casual, real human phrasing (e.g. "honestly", "was a bit nervous before my session", "so glad I came here", "worth the travel").
2. Subtly include high-value SEO terms naturally (e.g., "${clinicName}", the specific treatment "${treatment}", the city "${patientCity || 'Kota'}", "experienced dermatologist", "clean and modern clinic").
3. Give 3 distinct variations:
   - Option 1 (Personal & Authentic): A warm, storytelling patient review (~50-80 words).
   - Option 2 (SEO & Regional Impact): Highlights doctor expertise, modern equipment, location/city travel, and visible results (~60-90 words).
   - Option 3 (Short & Punchy): Direct, enthusiastic, quick to read (~30-50 words).

Respond ONLY with valid JSON in this exact structure:
{
  "reviews": [
    {
      "title": "Natural & Personal",
      "badge": "⭐ Most Authentic",
      "text": "..."
    },
    {
      "title": "Detailed & Regional SEO",
      "badge": "🚀 Top for Google Maps",
      "text": "..."
    },
    {
      "title": "Quick & Direct",
      "badge": "⚡ Short & Sweet",
      "text": "..."
    }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Gemini API call failed', details: errText });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    console.error('Gemini generation error:', error);
    res.status(500).json({ error: 'Internal server error while generating review', message: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Skinssence Patient Review & Feedback AI running!`);
    console.log(` Patient QR/NFC URL: http://localhost:${PORT}`);
    console.log(` Admin Control Panel & Inbox: http://localhost:${PORT}/admin.html`);
    console.log(` Acrylic Standee Print Studio: http://localhost:${PORT}/standee.html`);
    console.log(`====================================================`);
  });
}

module.exports = app;
