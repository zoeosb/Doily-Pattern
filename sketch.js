let cx, cy;
let r1 = 80, r2 = 180, r3 = 280;
let r4 = 284;  // radius for semi-circle ring (between r1 and r2)

// Pixel size: change these to make dots bigger/smaller or closer/farther apart
let dotSize = 1.5;           // size of each dot (try 2–6)
let circleDotSpacing = 8;  // spacing of dots on the circle rings
let fillSpacing = 4;       // spacing of dots filling the areas

// Butterfly orientation in degrees (0 = wings left-right, 90 = up-down, 180 = left-right flipped, 270 = up-down)
let butterflyAngle = 180;
let butterflySpin = 0;

let flowerspin = 0;

// Butterfly Generation
let butterflyCount = 4;
let butterflyRadius = 130;

// Scallop 
let scallopCount = 45;
let scallopR = 30;

// Ripple effect when mouse hovers
let rippleRadius = 40;
let rippleStrength = 200;

let poem = [
  "Flowers",
  "resting",
  "on",
  "the sand",
  "butterflies fluttering",
  "across my cheek",
  "doiles sitting in the sun",
  "things that make me",
  "homesick"
];

let poemIndex = 0;

function mousePressed() {
  poemIndex = (poemIndex + 1) % poem.length;
}

function setup() {
  createCanvas(800, 800);
  cx = width / 2;
  cy = height / 2;
}

function draw() {
  background(255);

  butterflySpin += 0.00;   // controls spinning speed
  flowerspin += 0.03;   // controls spinning speed

  // Circles made of small pixels (inner two)
  fill(80);
  noStroke();
  drawCirclePixels(cx, cy, r1);
  drawCirclePixels(cx, cy, r2);
  drawCirclePixels(cx, cy, r4);

  // Pixels filling inside center circle (then we draw flower on top)
  fill(80);
  dotsInCircle(cx, cy, r1 - 4);

  // Center flower (pixels)
  drawFlowerPixels(cx, cy, 6, 25, 15, 40, 10);  // 6 petals, center radius 15

  // 4 butterflies - all same direction as 90 and 180 (wings horizontal)
  fill(150, 220, 150);
  for (let i = 0; i < butterflyCount; i++) {

    let a = TWO_PI * i / butterflyCount;
  
    let x = cx + butterflyRadius * cos(a);
    let y = cy + butterflyRadius * sin(a);
  
    drawButterfly(x, y);
  }

  drawScallopedEdge(cx, cy, r3, scallopR, scallopCount);

  drawCircularText(cx, cy, 90);

  // Pixels filling middle ring
  fill(80);
  dotsInRing(cx, cy, r1 + 2, r2 - 2);

  // 10 flowers in outer ring (pixels)
  for (let i = 0; i < 10; i++) {
    let a = (TWO_PI * i) / 10 - HALF_PI;
    let x = cx + 230 * cos(a);
    let y = cy + 230 * sin(a);
    drawFlowerPixels(x, y, 5, 10, 8, 20, 7);  // 5 petals, center radius 7
  }

  // Pixels filling outer ring
  fill(80);
  dotsInRing(cx, cy, r2 + 2, r3 - 2);
}

// Draw a flower made of small pixels (petals + center)
function drawFlowerPixels(x, y, petals, petalOffset, petalW, petalH, centerR) {
  noStroke();

  let flowerSpacing = 2;
  let halfW = petalW / 1;
  let halfH = petalH / 3;

  // Petals
  fill(255, 150, 150);
  for (let p = 0; p < petals; p++) {
    let baseAngle = (TWO_PI * p) / petals - HALF_PI;
    for (let px = -halfW; px <= halfW; px += flowerSpacing) {
      for (let py = petalOffset - halfH; py <= petalOffset + halfH; py += flowerSpacing) {
        let dy = py - petalOffset;
        if ((px * px) / (halfW * halfW) + (dy * dy) / (halfH * halfH) <= 1) {
          let gx = x + px * cos(baseAngle) - py * sin(baseAngle);
          let gy = y + px * sin(baseAngle) + py * cos(baseAngle);
          ellipse(gx, gy, dotSize, dotSize);
        }
      }
    }
  }

  // Center
  fill(255, 200, 200);
  for (let px = -centerR; px <= centerR; px += flowerSpacing) {
    for (let py = -centerR; py <= centerR; py += flowerSpacing) {
      if (px * px + py * py <= centerR * centerR) {
        ellipse(x + px, y + py, dotSize, dotSize);
      }
    }
  }
}

function drawButterfly(x, y) {
  push();
  translate(x, y);

  rotate(radians(butterflyAngle) + butterflySpin);

  let flap = sin(frameCount * 0.04) * 0.4; // wing flapping motion

  noStroke();

  fill(150, 220, 150);

  // left wings
  push();
  rotate(-flap);
  ellipse(-12, -6, 24, 20);
  ellipse(-12, 6, 24, 20);
  pop();

  // right wings
  push();
  rotate(flap);
  ellipse(12, -6, 24, 20);
  ellipse(12, 6, 24, 20);
  pop();

  // body
  fill(80, 180, 80);
  ellipse(0, 0, 8, 30);

  pop();
}

// Draw a circle as a ring of small dots
function drawCirclePixels(cx, cy, radius) {
  fill(80);
  noStroke();
  let circumference = TWO_PI * radius;
  let numDots = max(50, floor(circumference / circleDotSpacing));
  for (let i = 0; i < numDots; i++) {
    let a = (TWO_PI * i) / numDots;
    ellipse(cx + radius * cos(a), cy + radius * sin(a), dotSize, dotSize);
  }
}

function dotsInCircle(cx, cy, maxR) {
  noStroke();
  for (let x = cx - maxR; x <= cx + maxR; x += fillSpacing) {
    for (let y = cy - maxR; y <= cy + maxR; y += fillSpacing) {
      if (dist(x, y, cx, cy) < maxR) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInRing(cx, cy, innerR, outerR) {
  noStroke();
  for (let x = cx - outerR; x <= cx + outerR; x += fillSpacing) {
    for (let y = cy - outerR; y <= cy + outerR; y += fillSpacing) {
      let d = dist(x, y, cx, cy);
      if (d >= innerR && d <= outerR) {
        drawRippleDot(x, y);
      }
    }
  }
}

function drawRippleDot(px, py) {
  let d = dist(px, py, mouseX, mouseY);
  let size = dotSize;
  let ox = 0, oy = 0;
  if (d < rippleRadius && d > 0) {
    let wave = sin(d * 0.5 - frameCount * 0.01) * (1 - d / rippleRadius) * rippleStrength;
    let angle = atan2(py - mouseY, px - mouseX);
    ox = cos(angle) * wave;
    oy = sin(angle) * wave;
    size = dotSize + (1 - d / rippleRadius) * 1;
  }
  ellipse(px + ox, py + oy, size, size);
}

function drawScallopedEdge(cx, cy, radius, scallopR, count) {

  noStroke();
  fill(80);

  for (let i = 0; i < count; i++) {

    let a = TWO_PI * i / count;

    let x = cx + cos(a) * (radius + scallopR);
    let y = cy + sin(a) * (radius + scallopR);

    dotsInCircle(x, y, scallopR);
  }
}

// Draws Poem near the centre 
function drawCircularText(cx, cy, radius) {

  let word = poem[poemIndex];
  let step = TWO_PI / word.length;

  push();
  translate(cx, cy);

  textAlign(CENTER, CENTER);
  textSize(16);
  fill(60);

  for (let i = 0; i < word.length; i++) {

    let a = i * step - HALF_PI;

    push();

    rotate(a);
    translate(radius, 0);
    rotate(HALF_PI);

    text(word[i], 0, 0);

    pop();
  }

  pop();
}

// Regenerate Pattern
function keyPressed() {

  if (key === 'h') {

    butterflyCount = floor(random(2,7));
    flowerCount = floor(random(6,14));

    scallopCount = floor(random(30,60));

    palette = random(palettes);
  }

}