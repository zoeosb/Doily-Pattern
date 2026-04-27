let cx, cy;
let r1 = 80, r2 = 180, r3 = 280;
let r4 = 284;  // radius for semi-circle ring (between r1 and r2)


// Pixel size: change these to make dots bigger/smaller or closer/farther apart
let dotSize = 2;           // size of each dot (try 2–6)
let flowerDotSize = 1.5;     // flower-only dot size
let circleDotSpacing = 8;  // spacing of dots on the circle rings
let fillSpacing = 4;       // spacing of dots filling the areas


// Butterfly orientation in degrees (0 = wings left-right, 90 = up-down, 180 = left-right flipped, 270 = up-down)
let butterflyAngle = 180;
let butterflySpin = 0;


let flowerspin = 0;


// Butterfly and flower count for Pattern
let butterflyCount;
let flowerCount;

let flowerColors = [];
let butterflyPositions = [];


let palettes = [
  ["#FF9999"],//Pink
  ["#CCCCFF"],//Blue
  ["#f6d7a7"],//Cream
  ["#a6c8ff"],//Light Blue
];


let palette;


// Scallop
let scallopCount = 45;
let scallopR = 30;


// Ripple effect when mouse hovers
let rippleRadius = 40;
let rippleStrength = 300;


let dotColor = "#f6d7a7";


// Poem
let poem = [ "BUTTERFLIES FLUTTERING ACROSS MY CHEEK", "FLOWERS RESTING ON THE SAND", "DOILES SITTING IN THE SUN", "THINGS THAT MAKE ME", "HOMESICK" ];


let poemIndex = 0;
let poemAlpha = 0;

// Poem caption settings
let poemTextSize = 20;        // main size target
let poemTextMinSize = 14;     // smallest allowed when fitting width
let poemTextColor = "#ffffff";

// Poem font: leave poemFontFile empty to use a system / web font name; or set a path like "fonts/MyFont.ttf"
let poemFontFile = "";
let poemFontFamily = "Doto"; // loaded in index.html via Google Fonts
let poemFontCustom = null;

let popupStartTime = 0;
let popupShowMs = 3000;
let popupFadeMs = 1000;
let showGameFrame = true;



function preload() {
  if (poemFontFile && poemFontFile.length > 0) {
    poemFontCustom = loadFont(poemFontFile);
  }
}


function setup() {
  createCanvas(800, 800);
  cx = width / 2;
  cy = height / 2;

  popupStartTime = millis();

  generatePattern();
}



function draw() {
  drawPixelGradientBackground();

  if (showGameFrame) {
    drawGameFrame();
  }


  butterflySpin += 0.00;   // controls spinning speed
  flowerspin += 0.03;   // controls spinning speed



  // Circles made of small pixels (inner two)
  fill(dotColor);
  noStroke();
  drawCirclePixels(cx, cy, r1);
  drawCirclePixels(cx, cy, r2);
  drawCirclePixels(cx, cy, r4);


  // Pixels filling inside center circle (then we draw flower on top)
  fill(dotColor);
  dotsInCircle(cx, cy, r1 - 4);
 
 
  // Center flower (pixels)
  drawFlowerPixels(cx, cy, 6, 25, 15, 40, 10,"#FFC8C8");  // 6 petals, center radius 15


  // 4 butterflies - generative location
  for (let i = 0; i < butterflyCount; i++) {


    let a = butterflyPositions[i];
 
    let x = cx + 130 * cos(a);
    let y = cy + 130 * sin(a);
 
    drawButterfly(x, y);


  }


  drawScallopedEdge(cx, cy, r3, scallopR, scallopCount);


    // Pixels filling middle ring
    fill(dotColor);
    dotsInRing(cx, cy, r1 + 2, r2 - 2);


  // 10 flowers in outer ring (pixels)
  for (let i = 0; i < flowerCount; i++) {


    let a = TWO_PI * i / flowerCount - HALF_PI;
 
    let x = cx + 230 * cos(a);
    let y = cy + 230 * sin(a);
 
    fill(flowerColors[i]);
 
    drawFlowerPixels(x, y, 5, 10, 8, 20, 7, flowerColors[i]);


     // Pixels filling outer ring
  fill(dotColor);
  dotsInRing(cx, cy, r2 + 2, r3 - 2);
}

  // 4 corner flowers using center flower geometry
  let cornerMargin = 88;
  let cornerFlowers = [
    { x: cornerMargin, y: cornerMargin },
    { x: width - cornerMargin, y: cornerMargin },
    { x: cornerMargin, y: height - cornerMargin },
    { x: width - cornerMargin, y: height - cornerMargin }
  ];

  for (let i = 0; i < cornerFlowers.length; i++) {
    let p = cornerFlowers[i];
    let c = flowerColors[i % flowerColors.length];
    drawFlowerPixels(p.x, p.y, 6, 25, 15, 40, 10, c);
  }

  // Small popup instruction
  drawHelpPopup();

  // Bottom poem caption (drawn last so it sits below other elements visually)
  drawPoemLine();
}


// Draw a flower made of small pixels (petals + center)
function drawFlowerPixels(x, y, petals, petalOffset, petalW, petalH, centerR, petalColor) {
  noStroke();


  let flowerSpacing = 2;
  let halfW = petalW / 1;
  let halfH = petalH / 3;


  // Petals
  fill(petalColor);
  for (let p = 0; p < petals; p++) {
    let baseAngle = (TWO_PI * p) / petals - HALF_PI;
    for (let px = -halfW; px <= halfW; px += flowerSpacing) {
      for (let py = petalOffset - halfH; py <= petalOffset + halfH; py += flowerSpacing) {
        let dy = py - petalOffset;
        if ((px * px) / (halfW * halfW) + (dy * dy) / (halfH * halfH) <= 1) {
          let gx = x + px * cos(baseAngle) - py * sin(baseAngle);
          let gy = y + px * sin(baseAngle) + py * cos(baseAngle);
          ellipse(gx, gy, flowerDotSize, flowerDotSize);
        }
      }
    }
  }


  // Center
  fill(255, 200, 200);
  for (let px = -centerR; px <= centerR; px += flowerSpacing) {
    for (let py = -centerR; py <= centerR; py += flowerSpacing) {
      if (px * px + py * py <= centerR * centerR) {
        ellipse(x + px, y + py, flowerDotSize, flowerDotSize);
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


  fill(242, 184, 187);


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
  fill(204, 141, 144);
  ellipse(0, 0, 8, 30);


  pop();
}


// Draw a circle as a ring of small dots
function drawCirclePixels(cx, cy, radius) {
  fill(dotColor);
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
  fill(dotColor);


  for (let i = 0; i < count; i++) {


    let a = TWO_PI * i / count;


    let x = cx + cos(a) * (radius + scallopR);
    let y = cy + sin(a) * (radius + scallopR);


    dotsInCircle(x, y, scallopR);
  }
}

function drawHelpPopup() {
  let elapsed = millis() - popupStartTime;
  if (elapsed > popupShowMs + popupFadeMs) return;

  let alpha = 255;
  if (elapsed > popupShowMs) {
    alpha = map(elapsed, popupShowMs, popupShowMs + popupFadeMs, 255, 0, true);
  }

  push();
  rectMode(CENTER);
  textAlign(CENTER, BOTTOM);
  textSize(20);
  noStroke();
  fill(0, 120 * (alpha / 255));
  rect(width / 2, 42, 160, 44, 12);

  fill(255, alpha);
  text("Press H", width / 2, 42);
  pop();
}


function drawPoemLine() {
  poemAlpha = min(poemAlpha + 7, 255);
  let line = poem[poemIndex];

  push();
  textAlign(CENTER, BOTTOM);
  noStroke();

  if (poemFontCustom) {
    textFont(poemFontCustom);
  } else {
    textFont(poemFontFamily);
  }

  // Make each line fill most of the canvas width while staying on one line.
  let maxWidth = width - 30;
  let size = poemTextSize;
  textSize(size);
  while (textWidth(line) > maxWidth && size > poemTextMinSize) {
    size -= 1;
    textSize(size);
  }

  let c = color(poemTextColor);
  c.setAlpha(poemAlpha);
  fill(c);
  text(line, width / 2, height - 28);
  pop();
}

function drawPixelGradientBackground() {
  let lineStep = max(2, round(fillSpacing));
  let topColor = color(217, 174, 155);
  let midColor = color(196, 135, 114);
  let bottomColor = color(217, 116, 120);

  strokeWeight(lineStep);
  for (let y = 0; y < height; y += lineStep) {
    let t = y / height;
    let c;
    if (t < 0.5) {
      c = lerpColor(topColor, midColor, t * 2);
    } else {
      c = lerpColor(midColor, bottomColor, (t - 0.5) * 2);
    }
    stroke(c);
    line(0, y, width, y);
  }
}

function drawGameFrame() {
  push();
  let gridSize = max(2, round(fillSpacing));

  // White pixel grid overlay
  stroke(255, 55);
  strokeWeight(1);
  for (let y = 0; y < height; y += gridSize) {
    line(0, y, width, y);
  }
  for (let x = 0; x < width; x += gridSize) {
    line(x, 0, x, height);
  }

  pop();
}


// Regenerate Pattern


  function keyPressed(){


    if(key === 'h' || key === 'H'){
      generatePattern();
      popupStartTime = millis();
    }

    if (key === 'f' || key === 'F') {
      showGameFrame = !showGameFrame;
    }
 
  }


function generatePattern(){


  butterflyCount = floor(random(2,7));
  flowerCount = floor(random(6,14));


  palette = random(palettes);


  flowerColors = [];
  butterflyPositions = [];


  for(let i = 0; i < flowerCount; i++){
    flowerColors.push(random(palette));
  }


  for(let i = 0; i < butterflyCount; i++){
    butterflyPositions.push(TWO_PI * i / butterflyCount);
  }


}


// CLICK TO ADVANCE POEM
function mousePressed() {
  poemIndex = (poemIndex + 1) % poem.length;
  poemAlpha = 0; // resets fade every click
}




