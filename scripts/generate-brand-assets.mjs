// Generates the brand image assets referenced by metadata + site.webmanifest:
//   public/og-default.png            1200x630  (Open Graph / Twitter cards)
//   public/apple-touch-icon.png      180x180
//   public/android-chrome-192x192.png
//   public/android-chrome-512x512.png
//
// Run with: node scripts/generate-brand-assets.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

// White mortarboard + tassel, drawn around a 100x100 viewBox center.
const capGlyph = (fill = "#ffffff") => `
  <g fill="${fill}">
    <path d="M50 22 L92 40 L50 58 L8 40 Z"/>
    <path d="M28 48.5 L28 63 Q28 72 50 72 Q72 72 72 63 L72 48.5 L50 58 Z"/>
    <rect x="88.5" y="40" width="3" height="16" rx="1.5"/>
    <circle cx="90" cy="59.5" r="3.5"/>
  </g>`;

const iconSvg = (size) => {
  const r = Math.round(size * 0.22);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="55%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
    <radialGradient id="shine" cx="0.3" cy="0.2" r="0.9">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#shine)"/>
  <g transform="translate(${size * 0.1} ${size * 0.1}) scale(${(size * 0.8) / 100})">
    ${capGlyph()}
  </g>
</svg>`;
};

const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="50%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#134e4a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#2dd4bf"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.1" cy="0.9" r="0.7">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- faint grid for depth -->
  <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630"/>`).join("")}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}"/>`).join("")}
  </g>

  <!-- floating tiles (3D-ish depth) -->
  <rect x="920" y="120" width="150" height="150" rx="28" fill="#ffffff" fill-opacity="0.05" transform="rotate(12 995 195)"/>
  <rect x="980" y="330" width="110" height="110" rx="22" fill="#ffffff" fill-opacity="0.07" transform="rotate(-9 1035 385)"/>
  <rect x="820" y="440" width="90" height="90" rx="18" fill="#ffffff" fill-opacity="0.05" transform="rotate(18 865 485)"/>

  <!-- logo tile -->
  <g transform="translate(96 96)">
    <rect width="132" height="132" rx="30" fill="url(#card)"/>
    <rect width="132" height="132" rx="30" fill="#ffffff" fill-opacity="0.08"/>
    <g transform="translate(16 16) scale(1)">
      ${capGlyph()}
    </g>
  </g>

  <!-- wordmark -->
  <text x="96" y="330" font-family="Helvetica, Arial, sans-serif" font-size="104" font-weight="700" fill="#ffffff" letter-spacing="-2">Edu<tspan fill="url(#accent)">Boost</tspan></text>

  <!-- tagline -->
  <text x="98" y="398" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#d1fae5" fill-opacity="0.92">Free video courses — students teaching students</text>

  <!-- underline accent -->
  <rect x="98" y="432" width="220" height="6" rx="3" fill="url(#accent)"/>

  <!-- site pill -->
  <g>
    <rect x="96" y="486" width="360" height="52" rx="26" fill="#ffffff" fill-opacity="0.1" stroke="#34d399" stroke-opacity="0.45"/>
    <text x="276" y="520" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="#a7f3d0">eduboostonline.com</text>
  </g>

  <!-- big translucent cap on the right -->
  <g transform="translate(760 150) scale(3.6)" opacity="0.16">
    ${capGlyph()}
  </g>
</svg>`;

const jobs = [
  { name: "og-default.png", svg: ogSvg },
  { name: "apple-touch-icon.png", svg: iconSvg(180) },
  { name: "android-chrome-192x192.png", svg: iconSvg(192) },
  { name: "android-chrome-512x512.png", svg: iconSvg(512) },
];

for (const { name, svg } of jobs) {
  const out = path.join(publicDir, name);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log("wrote", out);
}
