const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0a0a0f');
  gradient.addColorStop(1, '#05050a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Accent glow
  const glowGradient = ctx.createRadialGradient(
    size * 0.3, size * 0.3, 0,
    size * 0.5, size * 0.5, size * 0.6
  );
  glowGradient.addColorStop(0, 'rgba(255, 87, 34, 0.3)');
  glowGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, size, size);

  // HQ Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.35}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HQ', size / 2, size / 2);

  // Bottom accent line
  ctx.fillStyle = '#ff5722';
  ctx.fillRect(size * 0.2, size * 0.75, size * 0.6, size * 0.03);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public', filename), buffer);
  console.log(`Generated ${filename}`);
}

generateIcon(192, 'icon-192.png');
generateIcon(512, 'icon-512.png');
console.log('Icons generated successfully!');
