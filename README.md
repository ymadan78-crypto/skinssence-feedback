# Skinssence Laser and Skincare Clinic - Patient Feedback & AI Review System

A frictionless, mobile-first patient feedback application built specifically for **Skinssence Laser and Skincare Clinic** to multiply authentic, 5-star Google Business Profile reviews.

---

## 🌟 The Core Problem Solved
Patients often intend to leave a 5-star Google review, but they leave the clinic without doing it because:
1. They are in a rush.
2. They don't know what to write.
3. Writing a paragraph on a phone keyboard feels like homework.

### 💡 The Solution: 10-Second "Scan & Tap" Review Flow
1. **Patient Scans QR Code** at the reception desk or treatment room (zero app download required).
2. **3 Taps Only**:
   - **Step 1: Overall rating** (defaults to 5 stars).
   - **Step 2: Select treatment** (Laser Hair Reduction, HydraFacial, Acne Scars, Chemical Peel, etc.).
   - **Step 3: Select what they loved** (Painless technology, Doctor's expertise, Immediate glow, Clinic hygiene, Friendly staff).
3. **AI Crafts Natural, SEO-Optimized Reviews**:
   - Generates 3 humanized review options:
     - **Option 1 (Most Natural & Personal)**: Story-driven, conversational patient perspective.
     - **Option 2 (SEO & High-Impact)**: Targets high-ranking local keywords ("Skinssence Laser and Skincare Clinic", "best laser treatment", "experienced dermatologist", "clean facility").
     - **Option 3 (Short & Sweet)**: Direct and punchy.
4. **1-Click "Copy & Post to Google"**:
   - Patient clicks the button.
   - Text is automatically copied to their clipboard.
   - Google Review page opens instantly in a new tab or Google Maps app.
   - Patient simply taps "Paste" and submits!

---

## 🛡️ Negative Review Shield (Feedback Gating)
- If a patient selects **4 or 5 stars**: The app presents the positive AI review generator and direct Google Review link.
- If a patient selects **1, 2, or 3 stars**: The app automatically shields the clinic by routing them to a private resolution screen:
  > *"We are deeply sorry we fell short. Send private feedback directly to our Clinic Director so we can resolve this for you immediately."*
  This protects your Google Business Profile rating from impulse negative reviews while immediately alerting clinic management.

---

## 🖨️ Reception Standee & QR Studio
- Open `http://localhost:3000/standee.html` in your browser.
- Click **"Print Now"** to print a ready-to-use table-top tent / acrylic standee (formatted for 4x6" or A5 cardstock) to display at your reception desk.

---

## 🚀 Quick Start Guide

### 1. Run Locally
Double-click `start.bat` or run:
```bash
npm start
```
Then visit:
- **Patient Web App**: [http://localhost:3000](http://localhost:3000)
- **Printable Reception Standee**: [http://localhost:3000/standee.html](http://localhost:3000/standee.html)

### 2. Connect Your Google Business Profile
1. Go to your **Google Business Profile** manager.
2. Click **"Ask for reviews"** to copy your direct review link (e.g. `https://g.page/r/.../review`).
3. In the patient feedback app, tap the **⚙️ Settings icon** at the top right.
4. Paste your Google Review URL and click **Save**.

### 3. Deploy Online (Free in 2 Minutes)
To allow patients on their mobile phones to access it anywhere:
- **Option A (Vercel / Netlify / Render)**: Push to GitHub or upload the folder directly to Vercel/Render.
- **Option B (Static Hosting)**: You can also host `index.html` and `standee.html` on GitHub Pages, Cloudflare Pages, or Firebase Hosting. The built-in AI review engine works 100% in-browser with zero server required!

---

## 🤖 Dual AI Engine
- **Engine 1 (Built-in High-Entropy Humanizer)**: Works 100% offline and free with zero setup or API keys. Uses dozens of combinatorial clinical dermatology phrases to guarantee distinct, natural phrasing.
- **Engine 2 (Google Gemini Flash API)**: Optional. If you enter your free Google Gemini API key in the admin settings modal, it will generate dynamic bespoke reviews in real-time.
