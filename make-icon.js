const fs = require('fs');
const path = require('path');

// Simple 192x192 PNG placeholder generator or SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f43f5e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#grad)" />
  <text x="50%" y="54%" font-family="Georgia, serif" font-size="280" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">S</text>
  <circle cx="390" cy="120" r="32" fill="#10b981" stroke="#ffffff" stroke-width="8" />
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'icon.svg'), svg);
console.log('Icon SVG created!');
