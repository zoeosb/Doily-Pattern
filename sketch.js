let cx, cy;
let r1 = 80, r2 = 180, r3 = 280;
let r4 = 284;  // radius for semi-circle ring (between r1 and r2)


// Pixel size: change these to make dots bigger/smaller or closer/farther apart
let dotSize = 2;           // size of each dot (try 2–6)
let flowerDotSize = 1.5;     // flower-only dot size
// Outer-ring flowers (independent controls)
let outerFlowerDotSize = 1.5;
let outerFlowerPetals = 5;
let outerFlowerPetalOffset = 14;
let outerFlowerPetalW = 10;
let outerFlowerPetalH = 22;
let outerFlowerCenterR = 7;
let outerFlowerInnerPetals = 0;
let outerFlowerInnerOffset = 7;
let outerFlowerInnerW = 5;
let outerFlowerInnerH = 11;
let outerFlowerInnerCenterR = 3;
let outerFlowerMaskPadding = 2.5; // increase for slightly larger flower cutout
// Center carnation controls (edit these)
let centerFlowerRowCount = 4;         // number of petal rows
let centerFlowerPetalsStart = 8;     // petals in first row
let centerFlowerPetalsStep = 0;       // petals added each row
let centerFlowerOffsetStart = 6;     // distance from center for first row
let centerFlowerOffsetStep = 13;       // extra offset each row
let centerFlowerWidthStart = 8;       // first row petal width
let centerFlowerWidthStep = 2;        // width increase each row
let centerFlowerHeightStart = 16;     // first row petal height
let centerFlowerHeightStep = 6;       // height increase each row
let centerFlowerRowPhaseStep = 0.5;   // 0.5 = half-petal stagger per row
let centerFlowerAutoWidthFromOffset = true; // auto-stretch width by row circumference
let centerFlowerCircumferenceFill = 1.08;   // 1.0 fills exactly, >1 slightly overlaps
let centerFlowerRowColors = ["#FFC5D0","#f6d7a7"];
let centerFlowerRows = [];
let centerFlowerCoreR = 0; // set > 0 to bring back center core dots
let centerFlowerCoreColor = "#e37ba1";
let centerFlowerMaskPadding = 2;
let lanternScale = 1.2; // scale oil lantern panel uniformly
let circleDotSpacing = 8;  // spacing of dots on the circle rings
let fillSpacing = 4;       // spacing of dots filling the areas


// Butterfly orientation in degrees (0 = wings left-right, 90 = up-down, 180 = left-right flipped, 270 = up-down)
let butterflyAngle = 180;
let butterflySpin = 0;


let flowerspin = 0;


// Butterfly and flower count for Pattern
let butterflyCount;
let flowerCount;
let doilyShape = "circle"; // "circle" or "square"

let flowerColors = [];
let cornerFlowerColors = [];
let butterflyPositions = [];


let palettes = [
  ["#FF9999"],//Pink
  ["#CCCCFF"],//Blue
  ["#f6d7a7"],//Cream
  ["#a6c8ff"],//Light Blue
];

function buildCenterFlowerRows() {
  let rows = [];
  for (let i = 0; i < centerFlowerRowCount; i++) {
    let petals = max(1, centerFlowerPetalsStart + i * centerFlowerPetalsStep);
    let offset = max(1, centerFlowerOffsetStart + i * centerFlowerOffsetStep);
    let baseW = centerFlowerWidthStart + i * centerFlowerWidthStep;
    let arcPerPetal = TWO_PI * offset / petals;
    let autoW = (arcPerPetal * centerFlowerCircumferenceFill) / 2;
    rows.push({
      petals: petals,
      offset: offset,
      w: centerFlowerAutoWidthFromOffset ? max(1, autoW) : baseW,
      h: centerFlowerHeightStart + i * centerFlowerHeightStep,
      angleOffset: i * centerFlowerRowPhaseStep * TWO_PI / max(1, petals),
      color: centerFlowerRowColors[min(i, centerFlowerRowColors.length - 1)]
    });
  }
  return rows;
}


let palette;  
let paletteIndex = 0;


// Scallop
let scallopCount = 45;       // circle scallop count
let scallopR = 30;           // circle scallop radius
let squareScallopCount = 52; // square scallop count
let squareScallopR = 23;     // square scallop radius


// Ripple effect when mouse hovers
let rippleRadius = 40;
let rippleStrength = 300;


let dotColor = "#f6d7a7";


// Poem
let poem = [ "BUTTERFLIES FLUTTERING ACROSS MY CHEEK", "FLOWERS RESTING ON THE SAND", "DOILES SITTING IN THE SUN", "THINGS THAT MAKE ME", "HOMESICK" ];


let poemIndex = 0;
let poemAlpha = 0;
let poemCycleMs = 5000;
let lastPoemCycleMs = 0;

// Sound (generative ambient tone)
let soundEnabled = false;
let ambienceOsc = null;
let ambienceLfo = null;
let chimeOsc = null;
let chimeEnv = null;
let audioCtx = null;

// WASD navigation camera offset
let camX = 0;
let camY = 0;
let navSpeed = 4;
let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;
let pressedKeys = {};
let joystickActive = false;
let joystickVecX = 0;
let joystickVecY = 0;
let joystickOuterR = 44;
let joystickInnerR = 20;

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
function preload() {
  if (poemFontFile && poemFontFile.length > 0) {
    poemFontCustom = loadFont(poemFontFile);
  }
}


function setup() {
  createCanvas(800, 800);
  cx = width / 2;
  cy = height / 2;
  centerFlowerRows = buildCenterFlowerRows();

  popupStartTime = millis();
  lastPoemCycleMs = millis();
  setupSound();
  setupKeyboardControls();

  generatePattern();
}



function draw() {
  // Rebuild center flower rows so control changes apply immediately.
  centerFlowerRows = buildCenterFlowerRows();

  drawPixelGradientBackground();
  updateSound();
  updateNavigation();

  drawGameFrame();

  push();
  translate(camX, camY);

  butterflySpin += 0.00;   // controls spinning speed
  flowerspin += 0.03;   // controls spinning speed



  // Main doily geometry changes by sequence (circle or square)
  if (doilyShape === "circle") {
    fill(dotColor);
    noStroke();
    drawCirclePixels(cx, cy, r1);
    drawCirclePixels(cx, cy, r2);
    drawCirclePixels(cx, cy, r4);
    fill(dotColor);
    dotsInCircleMaskedByCenterFlower(cx, cy, r1 - 4, cx, cy);
  } else {
    let s1 = 80;
    let s2 = 180;
    let s3 = 284;
    fill(dotColor);
    noStroke();
    drawSquareRingPixels(cx, cy, s1);
    drawSquareRingPixels(cx, cy, s2);
    drawSquareRingPixels(cx, cy, s3);
    fill(dotColor);
    dotsInSquareMaskedByCenterFlower(cx, cy, s1 - 8, cx, cy);
  }
 
 
  // Center flower (carnation style: 4 petal rows + core)
  drawCenterFlowerCarnation(cx, cy);


  // 4 butterflies - generative location
  for (let i = 0; i < butterflyCount; i++) {


    let a = butterflyPositions[i];
 
    let x = cx + 130 * cos(a);
    let y = cy + 130 * sin(a);
 
    drawButterfly(x, y);


  }

  if (doilyShape === "circle") {
    drawScallopedEdge(cx, cy, r3, scallopR, scallopCount);
  } else {
    drawSquareScallopedEdge(cx, cy, 284, squareScallopR, squareScallopCount);
  }

  // Pixels filling middle ring (masked so dots never sit on center flower if radii overlap)
  fill(dotColor);
  if (doilyShape === "circle") {
    dotsInRingMaskedByCenterFlower(cx, cy, r1 + 2, r2 - 2, cx, cy);
  } else {
    dotsInSquareRing(cx, cy, 84, 176);
  }

  // Outer-ring flowers: positions + masked fill so dots never overlap flowers.
  let outerFlowerPositions = [];
  for (let i = 0; i < flowerCount; i++) {
    let x, y;
    if (doilyShape === "circle") {
      let a = TWO_PI * i / flowerCount - HALF_PI;
      x = cx + 230 * cos(a);
      y = cy + 230 * sin(a);
    } else {
      let p = getPointOnSquarePerimeter(cx, cy, 230, i / flowerCount);
      x = p.x;
      y = p.y;
    }
    outerFlowerPositions.push({ x, y });
  }

  // Pixels filling outer ring with flower cutouts (mask effect).
  fill(dotColor);
  if (doilyShape === "circle") {
    dotsInRingMaskedByFlowerShape(cx, cy, r2 + 2, r3 - 2, outerFlowerPositions);
  } else {
    dotsInSquareRingMaskedByFlowerShape(cx, cy, 184, 280, outerFlowerPositions);
  }

  // Draw larger crochet-integrated flowers on top, using flower color sequence.
  let nextPalette = getNextPaletteSequence();
  let flowerColorCount = max(1, flowerColors.length);
  let nextPaletteCount = max(1, nextPalette.length);
  let worldMouseX = mouseX - camX;
  let worldMouseY = mouseY - camY;
  for (let i = 0; i < outerFlowerPositions.length; i++) {
    let p = outerFlowerPositions[i];
    let idx = i % flowerColorCount;
    let c = flowerColors[idx] || dotColor;
    let nextC = nextPalette[i % nextPaletteCount] || c;
    // Hovering commits the "next sequence" flower color.
    if (isPointInSingleOuterFlowerShape(worldMouseX, worldMouseY, p.x, p.y)) {
      flowerColors[idx] = nextC;
      c = nextC;
    }
    drawFlowerPixels(
      p.x, p.y,
      outerFlowerPetals,
      outerFlowerPetalOffset,
      outerFlowerPetalW,
      outerFlowerPetalH,
      outerFlowerCenterR,
      c,
      outerFlowerDotSize
    );
    drawFlowerPixels(
      p.x, p.y,
      outerFlowerInnerPetals,
      outerFlowerInnerOffset,
      outerFlowerInnerW,
      outerFlowerInnerH,
      outerFlowerInnerCenterR,
      c,
      outerFlowerDotSize
    );
  }

  // 4 corner flowers using center flower geometry
  let cornerMargin = 64;
  let cornerFlowers = [
    { x: cornerMargin, y: cornerMargin },
    { x: width - cornerMargin, y: cornerMargin },
    { x: cornerMargin, y: height - cornerMargin },
    { x: width - cornerMargin, y: height - cornerMargin }
  ];

  for (let i = 0; i < cornerFlowers.length; i++) {
    let p = cornerFlowers[i];
    let c = cornerFlowerColors[i % max(1, cornerFlowerColors.length)] || dotColor;
    drawFlowerPixels(p.x, p.y, 6, 25, 15, 40, 10, c);
  }
  drawVaseBouquetPanel();
  drawIsometricMugPanel();
  drawOilLanternPanel();
  if (millis() - lastPoemCycleMs >= poemCycleMs) {
    lastPoemCycleMs = millis();
    poemIndex = (poemIndex + 1) % poem.length;
    poemAlpha = 0;
  }
  drawPoemLine();
  pop();

  drawJoystickHud();

  // Small popup instruction
  drawHelpPopup();
}

function drawCrochetFlowerHalo(x, y, radius) {
  noStroke();
  fill(dotColor);
  let count = 16;
  for (let i = 0; i < count; i++) {
    let a = TWO_PI * i / count;
    ellipse(x + radius * cos(a), y + radius * sin(a), dotSize, dotSize);
  }
}


// Draw a flower made of small pixels (petals + center)
function drawFlowerPixels(x, y, petals, petalOffset, petalW, petalH, centerR, petalColor, customDotSize, drawCenter = true, customCenterColor = null, angleOffset = 0) {
  noStroke();
  let dot = customDotSize === undefined ? flowerDotSize : customDotSize;


  let flowerSpacing = 2;
  let halfW = petalW / 1;
  let halfH = petalH / 3;


  // Petals
  fill(petalColor);
  for (let p = 0; p < petals; p++) {
    let baseAngle = (TWO_PI * p) / petals - HALF_PI + angleOffset;
    for (let px = -halfW; px <= halfW; px += flowerSpacing) {
      for (let py = petalOffset - halfH; py <= petalOffset + halfH; py += flowerSpacing) {
        let dy = py - petalOffset;
        if ((px * px) / (halfW * halfW) + (dy * dy) / (halfH * halfH) <= 1) {
          let gx = x + px * cos(baseAngle) - py * sin(baseAngle);
          let gy = y + px * sin(baseAngle) + py * cos(baseAngle);
          ellipse(gx, gy, dot, dot);
        }
      }
    }
  }


  // Center
  if (drawCenter && centerR > 0) {
    if (customCenterColor) {
      fill(customCenterColor);
    } else {
      fill(255, 200, 200);
    }
    for (let px = -centerR; px <= centerR; px += flowerSpacing) {
      for (let py = -centerR; py <= centerR; py += flowerSpacing) {
        if (px * px + py * py <= centerR * centerR) {
          ellipse(x + px, y + py, dot, dot);
        }
      }
    }
  }
}

function drawCenterFlowerCarnation(x, y) {
  for (let i = 0; i < centerFlowerRows.length; i++) {
    let row = centerFlowerRows[i];
    drawFlowerPixels(
      x,
      y,
      row.petals,
      row.offset,
      row.w,
      row.h,
      0,
      row.color,
      undefined,
      false,
      null,
      row.angleOffset
    );
  }
  drawFlowerPixels(
    x,
    y,
    0,
    0,
    0,
    0,
    centerFlowerCoreR,
    centerFlowerCoreColor,
    undefined,
    true,
    centerFlowerCoreColor
  );
}

function drawButterfly(x, y) {
  push();
  translate(x, y);


  rotate(radians(butterflyAngle) + butterflySpin);


  let flap = sin(frameCount * 0.04) * 0.4; // wing flapping motion


  noStroke();


  fill(235, 178, 178);


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
  fill(209, 142, 142);
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
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - maxR, b.minX);
  let xEnd = min(cx + maxR, b.maxX);
  let yStart = max(cy - maxR, b.minY);
  let yEnd = min(cy + maxR, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      if (dist(x, y, cx, cy) < maxR) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInCircleMaskedByCenterFlower(cx, cy, maxR, flowerCx, flowerCy) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - maxR, b.minX);
  let xEnd = min(cx + maxR, b.maxX);
  let yStart = max(cy - maxR, b.minY);
  let yEnd = min(cy + maxR, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      if (
        dist(x, y, cx, cy) < maxR &&
        !pointInCenterFlowerShape(x, y, flowerCx, flowerCy)
      ) {
        drawRippleDot(x, y);
      }
    }
  }
}


function dotsInRing(cx, cy, innerR, outerR) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - outerR, b.minX);
  let xEnd = min(cx + outerR, b.maxX);
  let yStart = max(cy - outerR, b.minY);
  let yEnd = min(cy + outerR, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = dist(x, y, cx, cy);
      if (d >= innerR && d <= outerR) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInRingMaskedByCenterFlower(cx, cy, innerR, outerR, flowerCx, flowerCy) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - outerR, b.minX);
  let xEnd = min(cx + outerR, b.maxX);
  let yStart = max(cy - outerR, b.minY);
  let yEnd = min(cy + outerR, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = dist(x, y, cx, cy);
      if (
        d >= innerR &&
        d <= outerR &&
        !pointInCenterFlowerShape(x, y, flowerCx, flowerCy)
      ) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInRingMasked(cx, cy, innerR, outerR, cutouts, cutoutR) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - outerR, b.minX);
  let xEnd = min(cx + outerR, b.maxX);
  let yStart = max(cy - outerR, b.minY);
  let yEnd = min(cy + outerR, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = dist(x, y, cx, cy);
      if (d >= innerR && d <= outerR && !isInsideAnyFlowerCutout(x, y, cutouts, cutoutR)) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInRingMaskedByFlowerShape(cx, cy, innerR, outerR, flowerPositions) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - outerR, b.minX);
  let xEnd = min(cx + outerR, b.maxX);
  let yStart = max(cy - outerR, b.minY);
  let yEnd = min(cy + outerR, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = dist(x, y, cx, cy);
      if (d >= innerR && d <= outerR && !isInsideAnyOuterFlowerShape(x, y, flowerPositions)) {
        drawRippleDot(x, y);
      }
    }
  }
}


function drawSquareRingPixels(cx, cy, halfSide) {
  noStroke();
  for (let x = cx - halfSide; x <= cx + halfSide; x += circleDotSpacing) {
    ellipse(x, cy - halfSide, dotSize, dotSize);
    ellipse(x, cy + halfSide, dotSize, dotSize);
  }
  for (let y = cy - halfSide; y <= cy + halfSide; y += circleDotSpacing) {
    ellipse(cx - halfSide, y, dotSize, dotSize);
    ellipse(cx + halfSide, y, dotSize, dotSize);
  }
}

function dotsInSquare(cx, cy, halfSide) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - halfSide, b.minX);
  let xEnd = min(cx + halfSide, b.maxX);
  let yStart = max(cy - halfSide, b.minY);
  let yEnd = min(cy + halfSide, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      drawRippleDot(x, y);
    }
  }
}

function dotsInSquareMaskedByCenterFlower(cx, cy, halfSide, flowerCx, flowerCy) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - halfSide, b.minX);
  let xEnd = min(cx + halfSide, b.maxX);
  let yStart = max(cy - halfSide, b.minY);
  let yEnd = min(cy + halfSide, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = max(abs(x - cx), abs(y - cy));
      if (
        d <= halfSide &&
        !pointInCenterFlowerShape(x, y, flowerCx, flowerCy)
      ) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInSquareRing(cx, cy, innerHalf, outerHalf) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - outerHalf, b.minX);
  let xEnd = min(cx + outerHalf, b.maxX);
  let yStart = max(cy - outerHalf, b.minY);
  let yEnd = min(cy + outerHalf, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = max(abs(x - cx), abs(y - cy));
      if (d >= innerHalf && d <= outerHalf) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInSquareRingMasked(cx, cy, innerHalf, outerHalf, cutouts, cutoutR) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - outerHalf, b.minX);
  let xEnd = min(cx + outerHalf, b.maxX);
  let yStart = max(cy - outerHalf, b.minY);
  let yEnd = min(cy + outerHalf, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = max(abs(x - cx), abs(y - cy));
      if (d >= innerHalf && d <= outerHalf && !isInsideAnyFlowerCutout(x, y, cutouts, cutoutR)) {
        drawRippleDot(x, y);
      }
    }
  }
}

function dotsInSquareRingMaskedByFlowerShape(cx, cy, innerHalf, outerHalf, flowerPositions) {
  noStroke();
  let b = getVisibleWorldBounds(rippleRadius + 8);
  let xStart = max(cx - outerHalf, b.minX);
  let xEnd = min(cx + outerHalf, b.maxX);
  let yStart = max(cy - outerHalf, b.minY);
  let yEnd = min(cy + outerHalf, b.maxY);
  for (let x = xStart; x <= xEnd; x += fillSpacing) {
    for (let y = yStart; y <= yEnd; y += fillSpacing) {
      let d = max(abs(x - cx), abs(y - cy));
      if (d >= innerHalf && d <= outerHalf && !isInsideAnyOuterFlowerShape(x, y, flowerPositions)) {
        drawRippleDot(x, y);
      }
    }
  }
}


function isInsideAnyFlowerCutout(x, y, cutouts, cutoutR) {
  for (let i = 0; i < cutouts.length; i++) {
    if (dist(x, y, cutouts[i].x, cutouts[i].y) < cutoutR) return true;
  }
  return false;
}

function isInsideAnyOuterFlowerShape(px, py, flowerPositions) {
  for (let i = 0; i < flowerPositions.length; i++) {
    let p = flowerPositions[i];
    if (isPointInSingleOuterFlowerShape(px, py, p.x, p.y)) {
      return true;
    }
  }
  return false;
}

function isPointInSingleOuterFlowerShape(px, py, fx, fy) {
  return (
    pointInDoilyFlowerLayer(px, py, fx, fy, outerFlowerPetals, outerFlowerPetalOffset, outerFlowerPetalW, outerFlowerPetalH, outerFlowerCenterR) ||
    pointInDoilyFlowerLayer(px, py, fx, fy, outerFlowerInnerPetals, outerFlowerInnerOffset, outerFlowerInnerW, outerFlowerInnerH, outerFlowerInnerCenterR)
  );
}

function getNextPaletteSequence() {
  if (!palettes || palettes.length === 0) return [dotColor];
  return palettes[(paletteIndex + 1) % palettes.length];
}

function pointInFlowerLayer(px, py, cx, cy, petals, petalOffset, petalW, petalH, centerR, maskPadding, angleOffset = 0) {
  if (petals <= 0) return false;
  let dx = px - cx;
  let dy = py - cy;
  let halfW = petalW + maskPadding;
  let halfH = petalH / 3 + maskPadding;
  let center = centerR + maskPadding;

  if (dx * dx + dy * dy <= center * center) return true;

  for (let p = 0; p < petals; p++) {
    let a = (TWO_PI * p) / petals - HALF_PI + angleOffset;
    let lx = dx * cos(-a) - dy * sin(-a);
    let ly = dx * sin(-a) + dy * cos(-a);
    let pyOff = ly - petalOffset;
    if ((lx * lx) / (halfW * halfW) + (pyOff * pyOff) / (halfH * halfH) <= 1) {
      return true;
    }
  }
  return false;
}

function pointInDoilyFlowerLayer(px, py, cx, cy, petals, petalOffset, petalW, petalH, centerR) {
  return pointInFlowerLayer(px, py, cx, cy, petals, petalOffset, petalW, petalH, centerR, outerFlowerMaskPadding);
}

function pointInCenterFlowerShape(px, py, flowerCx, flowerCy) {
  for (let i = 0; i < centerFlowerRows.length; i++) {
    let row = centerFlowerRows[i];
    if (
      pointInFlowerLayer(
        px,
        py,
        flowerCx,
        flowerCy,
        row.petals,
        row.offset,
        row.w,
        row.h,
        0,
        centerFlowerMaskPadding,
        row.angleOffset
      )
    ) {
      return true;
    }
  }
  let dx = px - flowerCx;
  let dy = py - flowerCy;
  let coreR = centerFlowerCoreR + centerFlowerMaskPadding;
  return dx * dx + dy * dy <= coreR * coreR;
}


function getPointOnSquarePerimeter(cx, cy, halfSide, t) {
  let side = halfSide * 2;
  let perimeter = side * 4;
  let d = (t % 1) * perimeter;
  if (d < side) return { x: cx - halfSide + d, y: cy - halfSide };
  if (d < side * 2) return { x: cx + halfSide, y: cy - halfSide + (d - side) };
  if (d < side * 3) return { x: cx + halfSide - (d - side * 2), y: cy + halfSide };
  return { x: cx - halfSide, y: cy + halfSide - (d - side * 3) };
}


function drawRippleDot(px, py) {
  if (!isWorldPointVisible(px, py, rippleRadius + 8)) return;

  let localMouseX = mouseX - camX;
  let localMouseY = mouseY - camY;
  let dx = px - localMouseX;
  let dy = py - localMouseY;
  let d2 = dx * dx + dy * dy;
  let rippleR2 = rippleRadius * rippleRadius;
  let size = dotSize;
  let ox = 0, oy = 0;
  if (d2 < rippleR2 && d2 > 0) {
    let d = sqrt(d2);
    let wave = sin(d * 0.5 - frameCount * 0.01) * (1 - d / rippleRadius) * rippleStrength;
    let angle = atan2(dy, dx);
    ox = cos(angle) * wave;
    oy = sin(angle) * wave;
    size = dotSize + (1 - d / rippleRadius) * 1;
  }
  ellipse(px + ox, py + oy, size, size);
}

function isWorldPointVisible(px, py, margin) {
  let m = margin || 0;
  return (
    px >= -camX - m &&
    px <= width - camX + m &&
    py >= -camY - m &&
    py <= height - camY + m
  );
}

function getVisibleWorldBounds(margin) {
  let m = margin || 0;
  return {
    minX: -camX - m,
    maxX: width - camX + m,
    minY: -camY - m,
    maxY: height - camY + m
  };
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

function drawSquareScallopedEdge(cx, cy, halfSide, scallopR, count) {
  noStroke();
  fill(dotColor);
  for (let i = 0; i < count; i++) {
    let p = getPointOnSquarePerimeter(cx, cy, halfSide, i / count);
    dotsInCircle(p.x, p.y, scallopR);
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
  textAlign(CENTER, CENTER);
  textSize(20);
  noStroke();
  fill(255, 255, 255, alpha * 0.5);
  rect(width / 2, 42, 160, 44, 12);

  fill(255, 153, 153, alpha); // Text color
  text("Press H", width / 2, 42);
  pop();
}


function measurePoemLine(line) {
  push();
  if (poemFontCustom) {
    textFont(poemFontCustom);
  } else {
    textFont(poemFontFamily);
  }
  let maxWidth = width - 30;
  let size = poemTextSize;
  textSize(size);
  while (textWidth(line) > maxWidth && size > poemTextMinSize) {
    size -= 1;
    textSize(size);
  }
  let tw = textWidth(line);
  let th = textAscent() + textDescent();
  pop();
  return { tw, th, size };
}

function isPointerOverPoemText(x, y) {
  let m = measurePoemLine(poem[poemIndex]);
  let pad = 8;
  // Poem is drawn inside translate(camX, camY); match screen position for hit-testing.
  let cx = width / 2 + camX;
  let textBottom = height - 28 + camY;
  let left = cx - m.tw / 2 - pad;
  let right = cx + m.tw / 2 + pad;
  let top = textBottom - m.th - pad;
  let bot = textBottom + pad;
  return x >= left && x <= right && y >= top && y <= bot;
}

function drawPoemLine() {
  poemAlpha = min(poemAlpha + 7, 255);
  let line = poem[poemIndex];
  let m = measurePoemLine(line);

  push();
  textAlign(CENTER, BOTTOM);
  noStroke();

  if (poemFontCustom) {
    textFont(poemFontCustom);
  } else {
    textFont(poemFontFamily);
  }

  textSize(m.size);

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

function updateNavigation() {
  let joyThreshold = 0.22;
  moveUp = !!pressedKeys["w"] || !!pressedKeys["arrowup"] || joystickVecY < -joyThreshold;
  moveDown = !!pressedKeys["s"] || !!pressedKeys["arrowdown"] || joystickVecY > joyThreshold;
  moveLeft = !!pressedKeys["a"] || !!pressedKeys["arrowleft"] || joystickVecX < -joyThreshold;
  moveRight = !!pressedKeys["d"] || !!pressedKeys["arrowright"] || joystickVecX > joyThreshold;

  if (moveUp) camY += navSpeed;      // W
  if (moveDown) camY -= navSpeed;    // S
  if (moveLeft) camX += navSpeed;    // A
  if (moveRight) camX -= navSpeed;   // D

  // Horizontal keeps half-canvas range; vertical is half of that.
  let maxOffsetX = width * 0.5;
  let maxOffsetY = height * 0.25;
  camX = constrain(camX, -maxOffsetX, maxOffsetX);
  camY = constrain(camY, -maxOffsetY, maxOffsetY);
}

function drawJoystickHud() {
  let base = getJoystickBase();
  let baseX = base.x;
  let baseY = base.y;
  let knobX = baseX + joystickVecX * joystickOuterR;
  let knobY = baseY + joystickVecY * joystickOuterR;

  push();
  noStroke();
  fill(255, 182, 193, 95);
  ellipse(baseX, baseY, joystickOuterR * 2, joystickOuterR * 2);
  fill(255, 203, 214, joystickActive ? 190 : 155);
  ellipse(knobX, knobY, joystickInnerR * 2, joystickInnerR * 2);
  pop();
}

function isInsideJoystick(px, py) {
  let base = getJoystickBase();
  let baseX = base.x;
  let baseY = base.y;
  return dist(px, py, baseX, baseY) <= joystickOuterR * 1.25;
}

function updateJoystickFromPointer(px, py) {
  let base = getJoystickBase();
  let baseX = base.x;
  let baseY = base.y;
  let dx = px - baseX;
  let dy = py - baseY;
  let d = sqrt(dx * dx + dy * dy);
  if (d > joystickOuterR && d > 0) {
    dx = (dx / d) * joystickOuterR;
    dy = (dy / d) * joystickOuterR;
  }
  joystickVecX = joystickOuterR > 0 ? dx / joystickOuterR : 0;
  joystickVecY = joystickOuterR > 0 ? dy / joystickOuterR : 0;
}

function releaseJoystick() {
  joystickActive = false;
  joystickVecX = 0;
  joystickVecY = 0;
}

function getJoystickBase() {
  // Match first-screen bottom-right corner flower center.
  let cornerMargin = 64;
  return {
    x: width - cornerMargin,
    y: height - cornerMargin
  };
}

function drawIsometricMugPanel() {
  // Positioned outside the original 800x800 view, to the right of corner flowers.
  let mugX = width + 170;
  let mugY = 490;
  let mugW = 170;
  let mugH = 76;
  let dot = 4;
  let row = 8;
  let mugScale = 0.5;

  push();
  translate(mugX, mugY);
  scale(mugScale);
  translate(-mugX, -mugY);
  noStroke();

  // Rectangular mug body with straighter sides.
  fill(255, 237, 194);
  drawDotEllipse(mugX, mugY - 28, mugW + 10, mugH + 6, dot, row); // thick rolled rim
  fill(255, 237, 194);
  drawDotRoundedRect(mugX - 82, mugY - 2, 164, 154, 10, dot, row); // rectangular body
  fill(227, 123, 161);
  drawDotRoundedRect(mugX - 72, mugY + 16, 144, 26, 6, dot, row); // glaze band
  fill(245, 224, 186);
  drawDotRoundedRect(mugX + 54, mugY + 8, 8, 126, 6, dot, row); // narrow highlight keeps side straight
  fill(227, 123, 161);
  drawDotRoundedRect(mugX - 34, mugY + 120, 68, 22, 6, dot, row); // foot ring

  // Chocolate liquid
  fill(91, 52, 34);
  drawDotEllipse(mugX, mugY - 21, mugW - 34, mugH - 34, dot, row);

  // Chunky strap handle.
  fill(255, 237, 194);
  drawDotRing(mugX + mugW / 2 + 16, mugY + 60, 58, 90, 18, dot, row);
  fill(255, 237, 194);
  drawDotEllipse(mugX + mugW / 2 + 8, mugY + 60, 14, 58, dot, row);
  pop();
}

function drawVaseBouquetPanel() {
  // Positioned outside the original 800x800 view, to the left of corner flowers.
  let vaseX = -185;
  let vaseY = 470;
  let dot = 6;
  let row = 8;

  noStroke();

  // Stems
  fill("#e8bac5");
  drawDotStem(vaseX - 40, vaseY - 170, vaseX - 18, vaseY - 34, dot, row);
  drawDotStem(vaseX - 20, vaseY - 190, vaseX - 10, vaseY - 36, dot, row);
  drawDotStem(vaseX + 0, vaseY - 182, vaseX + 0, vaseY - 36, dot, row);
  drawDotStem(vaseX + 22, vaseY - 194, vaseX + 10, vaseY - 36, dot, row);
  drawDotStem(vaseX + 44, vaseY - 174, vaseX + 18, vaseY - 34, dot, row);

  // Leaves
  fill("#f2d1d9");
  drawDotLeaf(vaseX - 30, vaseY - 118, 26, 14, -0.4, dot, row);
  drawDotLeaf(vaseX + 24, vaseY - 124, 28, 14, 0.5, dot, row);
  drawDotLeaf(vaseX - 8, vaseY - 96, 24, 12, 0.3, dot, row);

  // Bouquet flowers
  fill(252, 169, 187); //soft pink
  drawDotFlowerHead(vaseX - 46, vaseY - 186, 24, dot, row);
  fill(212, 186, 205); //blue
  drawDotFlowerHead(vaseX - 22, vaseY - 206, 22, dot, row);
  fill(250, 170, 125); //light cream
  drawDotFlowerHead(vaseX + 2, vaseY - 198, 24, dot, row);
  fill(255, 179, 179); //light pink
  drawDotFlowerHead(vaseX + 28, vaseY - 208, 22, dot, row);
  fill(209, 186, 212); //light blue
  drawDotFlowerHead(vaseX + 52, vaseY - 188, 24, dot, row);

  // Vase neck
  fill(226, 168, 122); // less green neck
  drawDotRoundedRect(vaseX - 30, vaseY - 34, 60, 24, 10, dot, row);

  // Vase body (traditional round body + subtle shading)
  fill(240, 184, 124); // less green body
  drawDotEllipse(vaseX, vaseY + 42, 150, 158, dot, row);
  fill(206, 152, 106); // less green side shade
  drawDotEllipse(vaseX + 26, vaseY + 46, 44, 120, dot, row);

  // Vase foot
  fill(218, 162, 114); // less green foot
  drawDotRoundedRect(vaseX - 34, vaseY + 108, 68, 20, 8, dot, row);
}

function drawOilLanternPanel() {
  // Upper-right panel, styled after a classic glass-chimney oil lantern.
  let lx = width + 225; // moved left for visibility
  let ly = 200;
  let dot = 3.2;
  let row = 6;

  push();
  translate(lx, ly);
  scale(lanternScale);
  translate(-lx, -ly);
  noStroke();

  // Top rim/cap
  fill(178, 160, 146);
  drawDotEllipse(lx, ly - 128, 34, 12, dot, row);
  fill(196, 179, 165);
  drawDotRoundedRect(lx - 14, ly - 132, 28, 8, 4, dot, row);

  // Glass chimney: neck + bulb + lower neck
  fill(236, 241, 246);
  drawDotEllipse(lx, ly - 90, 30, 70, dot, row);
  drawDotEllipse(lx, ly - 50, 54, 62, dot, row);
  drawDotEllipse(lx, ly - 16, 34, 36, dot, row);
  fill(210, 222, 233);
  drawDotEllipse(lx + 10, ly - 54, 12, 92, dot, row); // glass highlight/shadow

  // Burner deck + flame + support wires
  fill(164, 136, 104);
  drawDotRoundedRect(lx - 30, ly + 2, 60, 14, 5, dot, row);
  fill(255, 203, 118);
  drawDotEllipse(lx, ly - 2, 10, 20, dot, row);
  fill(120, 96, 72);
  drawDotStem(lx - 24, ly + 6, lx - 8, ly - 2, dot, row);
  drawDotStem(lx + 24, ly + 6, lx + 8, ly - 2, dot, row);

  // Burner knob
  fill(154, 118, 80);
  drawDotEllipse(lx + 34, ly + 12, 14, 10, dot, row);

  // Fuel reservoir (rounded bowl)
  fill(226, 214, 205);
  drawDotEllipse(lx, ly + 44, 96, 58, dot, row);
  fill(204, 189, 177);
  drawDotEllipse(lx + 18, ly + 44, 28, 44, dot, row);

  // Neck + foot
  fill(205, 220, 232);
  drawDotEllipse(lx, ly + 78, 34, 24, dot, row);
  drawDotRoundedRect(lx - 10, ly + 82, 20, 22, 6, dot, row);
  fill(200, 216, 230);
  drawDotEllipse(lx, ly + 102, 84, 26, dot, row);
  fill(182, 198, 214);
  drawDotEllipse(lx, ly + 108, 92, 14, dot, row);
  pop();
}

function drawDotEllipse(cx, cy, w, h, dot, spacing) {
  let rx = w / 2;
  let ry = h / 2;
  for (let x = -rx; x <= rx; x += spacing) {
    for (let y = -ry; y <= ry; y += spacing) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        ellipse(cx + x, cy + y, dot, dot);
      }
    }
  }
}

function drawDotRoundedRect(x, y, w, h, radius, dot, spacing) {
  let x2 = x + w;
  let y2 = y + h;
  for (let px = x; px <= x2; px += spacing) {
    for (let py = y; py <= y2; py += spacing) {
      if (isInsideRoundedRect(px, py, x, y, w, h, radius)) {
        ellipse(px, py, dot, dot);
      }
    }
  }
}

function isInsideRoundedRect(px, py, x, y, w, h, r) {
  let left = x + r;
  let right = x + w - r;
  let top = y + r;
  let bottom = y + h - r;

  if (px >= left && px <= right && py >= y && py <= y + h) return true;
  if (py >= top && py <= bottom && px >= x && px <= x + w) return true;

  let tl = (px - left) * (px - left) + (py - top) * (py - top) <= r * r;
  let tr = (px - right) * (px - right) + (py - top) * (py - top) <= r * r;
  let bl = (px - left) * (px - left) + (py - bottom) * (py - bottom) <= r * r;
  let br = (px - right) * (px - right) + (py - bottom) * (py - bottom) <= r * r;
  return tl || tr || bl || br;
}

function drawDotRing(cx, cy, outerW, outerH, thickness, dot, spacing) {
  let orx = outerW / 2;
  let ory = outerH / 2;
  let irx = max(1, orx - thickness);
  let iry = max(1, ory - thickness);

  for (let x = -orx; x <= orx; x += spacing) {
    for (let y = -ory; y <= ory; y += spacing) {
      let outerEq = (x * x) / (orx * orx) + (y * y) / (ory * ory);
      let innerEq = (x * x) / (irx * irx) + (y * y) / (iry * iry);
      if (outerEq <= 1 && innerEq >= 1) {
        ellipse(cx + x, cy + y, dot, dot);
      }
    }
  }
}

function drawDotStem(x1, y1, x2, y2, dot, spacing) {
  let d = dist(x1, y1, x2, y2);
  let steps = max(1, floor(d / (spacing * 0.9)));
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let x = lerp(x1, x2, t);
    let y = lerp(y1, y2, t);
    ellipse(x, y, dot, dot);
  }
}

function drawDotLeaf(cx, cy, w, h, angle, dot, spacing) {
  let rx = w / 2;
  let ry = h / 2;
  for (let x = -rx; x <= rx; x += spacing) {
    for (let y = -ry; y <= ry; y += spacing) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        let gx = cx + x * cos(angle) - y * sin(angle);
        let gy = cy + x * sin(angle) + y * cos(angle);
        ellipse(gx, gy, dot, dot);
      }
    }
  }
}

function drawDotFlowerHead(cx, cy, radius, dot, spacing) {
  for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
    let px = cx + cos(a) * (radius * 0.8);
    let py = cy + sin(a) * (radius * 0.8);
    drawDotEllipse(px, py, radius, radius * 0.8, dot, spacing);
  }
  fill(255, 236, 196);
  drawDotEllipse(cx, cy, radius * 0.75, radius * 0.75, dot, spacing);
}


// Regenerate Pattern


  function keyPressed(){
    startSound();

    if (key === 'w' || key === 'W') moveUp = true;
    if (key === 's' || key === 'S') moveDown = true;
    if (key === 'a' || key === 'A') moveLeft = true;
    if (key === 'd' || key === 'D') moveRight = true;


    if(key === 'h' || key === 'H'){
      generatePattern();
      playDreamChime();
    }

    // Keep browser from handling movement keys (scroll/focus behavior).
    if (
      key === 'w' || key === 'W' || key === 'a' || key === 'A' || key === 's' || key === 'S' || key === 'd' || key === 'D' ||
      keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW
    ) {
      return false;
    }
  }

function keyReleased() {
  if (
    key === 'w' || key === 'W' || key === 'a' || key === 'A' || key === 's' || key === 'S' || key === 'd' || key === 'D' ||
    keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW
  ) {
    return false;
  }
}

function windowBlurred() {
  // Safety reset if focus leaves the sketch while keys are held.
  pressedKeys = {};
  moveUp = false;
  moveDown = false;
  moveLeft = false;
  moveRight = false;
  releaseJoystick();
}

function setupKeyboardControls() {
  window.addEventListener("keydown", (e) => {
    let k = (e.key || "").toLowerCase();
    if (k === "w" || k === "a" || k === "s" || k === "d" || k === "arrowup" || k === "arrowdown" || k === "arrowleft" || k === "arrowright") {
      pressedKeys[k] = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    let k = (e.key || "").toLowerCase();
    if (k === "w" || k === "a" || k === "s" || k === "d" || k === "arrowup" || k === "arrowdown" || k === "arrowleft" || k === "arrowright") {
      pressedKeys[k] = false;
      e.preventDefault();
    }
  });

  window.addEventListener("blur", () => {
    pressedKeys = {};
    moveUp = false;
    moveDown = false;
    moveLeft = false;
    moveRight = false;
    releaseJoystick();
  });
}


function generatePattern(){


  butterflyCount = floor(random(2,7));
  doilyShape = random(["circle", "square"]);
  flowerCount = doilyShape === "circle" ? floor(random(6,10)) : floor(random(7,11));


  paletteIndex = floor(random(palettes.length));
  palette = palettes[paletteIndex];


  flowerColors = [];
  cornerFlowerColors = [];
  butterflyPositions = [];


  for(let i = 0; i < flowerCount; i++){
    flowerColors.push(random(palette));
  }

  for (let i = 0; i < 4; i++) {
    cornerFlowerColors.push(random(palette));
  }


  for(let i = 0; i < butterflyCount; i++){
    butterflyPositions.push(TWO_PI * i / butterflyCount);
  }


}


function mousePressed() {
  if (isInsideJoystick(mouseX, mouseY)) {
    joystickActive = true;
    updateJoystickFromPointer(mouseX, mouseY);
    return false;
  }

  // Touch taps are handled in touchStarted so we do not double-advance with synthetic mouse events.
  if (touches.length > 0) return;

  if (isPointerOverPoemText(mouseX, mouseY)) {
    startSound();
    poemIndex = (poemIndex + 1) % poem.length;
    poemAlpha = 0;
    lastPoemCycleMs = millis();
  }
}

function mouseDragged() {
  if (!joystickActive) return;
  updateJoystickFromPointer(mouseX, mouseY);
  return false;
}

function mouseReleased() {
  if (!joystickActive) return;
  releaseJoystick();
  return false;
}

function touchStarted() {
  if (touches.length < 1) return;
  let t = touches[0];
  if (isInsideJoystick(t.x, t.y)) {
    joystickActive = true;
    updateJoystickFromPointer(t.x, t.y);
    return false;
  }

  if (isPointerOverPoemText(t.x, t.y)) {
    startSound();
    poemIndex = (poemIndex + 1) % poem.length;
    poemAlpha = 0;
    lastPoemCycleMs = millis();
  }
}

function touchMoved() {
  if (!joystickActive || touches.length < 1) return;
  let t = touches[0];
  updateJoystickFromPointer(t.x, t.y);
  return false;
}

function touchEnded() {
  if (joystickActive) {
    releaseJoystick();
    return false;
  }
}

function setupSound() {
  // If p5.sound is not available, we still provide a Web Audio fallback chime.
  if (typeof p5 === "undefined" || typeof p5.Oscillator === "undefined") return;

  ambienceOsc = new p5.Oscillator("sine");
  ambienceOsc.amp(0);

  ambienceLfo = new p5.Oscillator("sine");
  ambienceLfo.freq(0.08);
  ambienceLfo.amp(40);

  chimeOsc = new p5.Oscillator("triangle");
  chimeOsc.amp(0);

  if (typeof p5.Envelope !== "undefined") {
    chimeEnv = new p5.Envelope();
    chimeEnv.setADSR(0.01, 0.25, 0.0, 1.8);
    chimeEnv.setRange(0.16, 0);
  }
}

function startSound() {
  if (soundEnabled) return;

  if (ambienceOsc && ambienceLfo) {
    userStartAudio();
    ambienceOsc.start();
    ambienceLfo.start();
    if (chimeOsc) {
      chimeOsc.start();
    }
    soundEnabled = true;
  } else {
    // Fallback path when p5.sound fails to load.
    try {
      let Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx && !audioCtx) {
        audioCtx = new Ctx();
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      soundEnabled = !!audioCtx;
    } catch (e) {
      soundEnabled = false;
    }
  }
}

function updateSound() {
  if (!soundEnabled || !ambienceOsc || !ambienceLfo) return;

  let motion = map(sin(frameCount * 0.02), -1, 1, 0, 1);
  let shapeOffset = doilyShape === "circle" ? 0 : 18;
  let baseFreq = 140 + flowerCount * 7 + shapeOffset;
  let mouseInfluence = map(mouseX, 0, width, -25, 25, true);
  let targetFreq = baseFreq + mouseInfluence + motion * 12;
  let targetAmp = map(mouseY, 0, height, 0.08, 0.02, true);

  ambienceOsc.freq(targetFreq, 0.15);
  ambienceOsc.amp(targetAmp, 0.2);
}

function playDreamChime() {
  if (!soundEnabled) startSound();
  if (!soundEnabled) return;

  if (!chimeOsc || !chimeEnv) {
    playDreamChimeFallback();
    return;
  }

  // Sparkly major-9 style voicing for a nostalgic 90s game chime.
  let base = random([60, 62, 65]); // C, D, F
  let offsets = [12, 16, 19, 23, 26];

  for (let i = 0; i < offsets.length; i++) {
    let delayMs = i * 160;
    let freq = midiToFreq(base + offsets[i]);
    setTimeout(() => {
      chimeOsc.freq(freq, 0.03);
      chimeEnv.play(chimeOsc, 0, 0.3);
    }, delayMs);
  }
}

function playDreamChimeFallback() {
  if (!audioCtx) return;

  let now = audioCtx.currentTime;
  let baseChoices = [60, 62, 65];
  let base = random(baseChoices);
  let offsets = [12, 16, 19, 23, 26];

  for (let i = 0; i < offsets.length; i++) {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    let freq = 440 * pow(2, ((base + offsets[i]) - 69) / 12);
    let start = now + i * 0.16;
    let end = start + 1.2;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}



